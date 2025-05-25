import React, { useState, useEffect, useCallback } from 'react';
import { PageContainer } from '../components/Layout/PageContainer';
import api, { TranscriptRecord, EnhancedTranscriptListItem, EnhancedTranscriptRecord, TwilioTranscriptResponse } from '../services/apiClient';
import { toast } from 'react-hot-toast';
import { ArrowPathIcon, MagnifyingGlassIcon, PhoneArrowUpRightIcon, PhoneArrowDownLeftIcon } from '@heroicons/react/24/outline';

const ITEMS_PER_PAGE = 10;

// Transform Twilio transcript data to our enhanced format
const transformTwilioToEnhanced = (twilioData: TwilioTranscriptResponse): EnhancedTranscriptRecord => {
  // Calculate participant info
  const speakerStats = twilioData.sentences.reduce((acc, sentence) => {
    const speaker = sentence.speaker.toString();
    if (!acc[speaker]) {
      acc[speaker] = {
        total_time: 0,
        word_count: 0,
        sentence_count: 0
      };
    }
    acc[speaker].total_time += sentence.end_time - sentence.start_time;
    acc[speaker].word_count += sentence.text.split(' ').length;
    acc[speaker].sentence_count += 1;
    return acc;
  }, {} as any);

  const totalWords = twilioData.sentences.reduce((sum, s) => sum + s.text.split(' ').length, 0);
  const avgConfidence = twilioData.sentences.reduce((sum, s) => sum + s.confidence, 0) / twilioData.sentences.length;

  // Transform to our enhanced format
  return {
    transcript_sid: twilioData.sid,
    call_date: twilioData.date_created,
    duration: twilioData.duration,
    call_direction: 'outbound', // Default
    scenario_name: 'Voice Call', // Default
    participant_info: Object.entries(speakerStats).reduce((acc, [speaker, stats]: [string, any]) => {
      acc[speaker] = {
        channel: parseInt(speaker),
        role: speaker === '1' ? 'agent' : 'customer',
        name: speaker === '1' ? 'AI Agent' : 'Customer',
        total_speaking_time: Math.round(stats.total_time),
        word_count: stats.word_count,
        sentence_count: stats.sentence_count
      };
      return acc;
    }, {} as any),
    conversation_flow: twilioData.sentences.map((sentence, index) => ({
      sequence: index + 1,
      speaker: {
        channel: sentence.speaker,
        role: sentence.speaker === 1 ? 'agent' : 'customer',
        name: sentence.speaker === 1 ? 'AI Agent' : 'Customer'
      },
      text: sentence.text,
      start_time: sentence.start_time,
      end_time: sentence.end_time,
      duration: sentence.end_time - sentence.start_time,
      confidence: sentence.confidence,
      word_count: sentence.text.split(' ').length
    })),
    summary_data: {
      total_duration_seconds: twilioData.duration,
      total_sentences: twilioData.sentences.length,
      total_words: totalWords,
      participant_count: Object.keys(speakerStats).length,
      average_confidence: avgConfidence,
      conversation_stats: {
        turns: twilioData.sentences.length,
        avg_words_per_turn: Math.round(totalWords / twilioData.sentences.length),
        speaking_time_distribution: Object.entries(speakerStats).reduce((acc, [speaker, stats]: [string, any]) => {
          acc[speaker] = {
            percentage: Math.round((stats.total_time / twilioData.duration) * 100),
            seconds: Math.round(stats.total_time)
          };
          return acc;
        }, {} as any)
      }
    },
    source_type: 'Twilio',
    status: twilioData.status,
    full_text: twilioData.sentences.map(s => s.text).join(' '),
    date_created: twilioData.date_created,
    date_updated: twilioData.date_updated,
    language_code: twilioData.language_code,
    created_at: twilioData.date_created
  };
};

export const CallNotes: React.FC = () => {
  const [transcripts, setTranscripts] = useState<EnhancedTranscriptListItem[]>([]);
  const [selectedTranscript, setSelectedTranscript] = useState<EnhancedTranscriptRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTranscript, setIsLoadingTranscript] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [filters, setFilters] = useState<{
    call_direction?: string;
    scenario_name?: string;
  }>({});
  const [debugInfo, setDebugInfo] = useState<string>('');

  // Add some test data for debugging
  const testTranscripts: EnhancedTranscriptListItem[] = [
    {
      transcript_sid: 'test-001',
      call_date: new Date().toISOString(),
      duration: 120,
      call_direction: 'outbound',
      scenario_name: 'Test Scenario',
      status: 'completed',
      participant_count: 2,
      total_words: 250,
      average_confidence: 0.92
    },
    {
      transcript_sid: 'test-002',
      call_date: new Date(Date.now() - 86400000).toISOString(),
      duration: 180,
      call_direction: 'inbound',
      scenario_name: 'Customer Support',
      status: 'completed',
      participant_count: 2,
      total_words: 320,
      average_confidence: 0.88
    }
  ];

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset pagination when search term or filters change
  useEffect(() => {
    setCurrentPage(0);
    fetchTranscripts(0);
  }, [debouncedSearchTerm, filters]);

  const fetchTranscripts = async (page: number) => {
    setIsLoading(true);
    setError(null);
    const skip = page * ITEMS_PER_PAGE;
    
    try {
      // Try Twilio transcripts first
      console.log('Attempting to fetch Twilio transcripts...');
      setDebugInfo('Trying Twilio transcripts...');
      const twilioData = await api.calls.getTwilioTranscripts(skip, ITEMS_PER_PAGE);
      
      // Transform Twilio list data to enhanced format
      const convertedData = twilioData.transcripts ? twilioData.transcripts.map((transcript: any) => ({
        transcript_sid: transcript.sid,
        call_date: transcript.date_created,
        duration: transcript.duration || 0,
        call_direction: 'outbound', // Default
        scenario_name: 'Voice Call', // Default
        status: transcript.status,
        participant_count: 2, // Default assumption
        total_words: transcript.sentences ? transcript.sentences.reduce((sum: number, s: any) => sum + s.text.split(' ').length, 0) : 0,
        average_confidence: transcript.sentences ? transcript.sentences.reduce((sum: number, s: any) => sum + s.confidence, 0) / transcript.sentences.length : 0.85
      })) : [];
      
      if (page === 0) {
        setTranscripts(convertedData);
      } else {
        setTranscripts(prev => [...prev, ...convertedData]);
      }
      
      setHasMore(convertedData.length === ITEMS_PER_PAGE);
      setCurrentPage(page);
      setDebugInfo(`Twilio transcripts loaded: ${convertedData.length} items`);
      console.log('Twilio transcripts loaded successfully:', convertedData.length, 'items');
    } catch (err) {
      console.log('Twilio transcripts failed, trying enhanced endpoint...', err);
      setDebugInfo('Twilio failed, trying enhanced...');
      
      // Fallback to enhanced transcripts
      try {
        const data = await api.calls.getEnhancedTranscripts(skip, ITEMS_PER_PAGE, filters);
        
        if (page === 0) {
          setTranscripts(data);
        } else {
          setTranscripts(prev => [...prev, ...data]);
        }
        
        setHasMore(data.length === ITEMS_PER_PAGE);
        setCurrentPage(page);
        setDebugInfo(`Enhanced transcripts loaded: ${data.length} items`);
        console.log('Enhanced transcripts loaded successfully:', data.length, 'items');
      } catch (enhancedErr) {
        console.log('Enhanced transcripts failed, trying legacy endpoint...', enhancedErr);
        setDebugInfo('Enhanced failed, trying legacy...');
        
        // Fallback to legacy transcripts
        try {
          const legacyData = await api.calls.getTranscripts(skip, ITEMS_PER_PAGE);
          console.log('Legacy transcripts loaded:', legacyData.length, 'items');
          
          // Convert legacy data to enhanced format for display
          const convertedData = legacyData.map(transcript => ({
            transcript_sid: transcript.transcript_sid,
            call_date: transcript.date_created,
            duration: transcript.duration,
            call_direction: 'outbound', // Default since legacy doesn't have this
            scenario_name: 'Legacy Call', // Default since legacy doesn't have this
            status: transcript.status,
            participant_count: 2, // Default assumption
            total_words: transcript.full_text ? transcript.full_text.split(' ').length : 0,
            average_confidence: 0.85 // Default assumption
          }));
          
          if (page === 0) {
            setTranscripts(convertedData);
          } else {
            setTranscripts(prev => [...prev, ...convertedData]);
          }
          
          setHasMore(legacyData.length === ITEMS_PER_PAGE);
          setCurrentPage(page);
          setDebugInfo(`Legacy transcripts loaded: ${legacyData.length} items`);
          toast.success('Loaded legacy transcript data');
        } catch (legacyErr) {
          console.error('All transcript fetch methods failed:', legacyErr);
          setDebugInfo('All API calls failed, using test data');
          
          // Use test data as final fallback
          if (page === 0) {
            setTranscripts(testTranscripts);
            setHasMore(false);
            setCurrentPage(0);
            toast.success('Using test data - API endpoints require authentication');
          }
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTranscriptDetails = async (transcriptSid: string) => {
    setIsLoadingTranscript(true);
    setSelectedTranscript(null);
    setError(null);
    try {
      console.log('Attempting to fetch Twilio transcript details for:', transcriptSid);
      const twilioData = await api.calls.getTwilioTranscriptById(transcriptSid);
      
      // Log the actual data structure to understand what we're getting
      console.log('Raw Twilio transcript data:', JSON.stringify(twilioData, null, 2));
      
      // Transform Twilio data to enhanced format
      const enhancedData = transformTwilioToEnhanced(twilioData);
      console.log('Transformed enhanced data:', enhancedData);
      
      setSelectedTranscript(enhancedData);
      console.log('Twilio transcript details loaded and transformed successfully');
    } catch (err) {
      console.log('Twilio transcript details failed, trying enhanced endpoint...', err);
      
      // Fallback to enhanced transcript details
      try {
        const data = await api.calls.getEnhancedTranscriptById(transcriptSid);
        setSelectedTranscript(data);
        toast.success('Loaded enhanced transcript details');
      } catch (enhancedErr) {
        console.log('Enhanced transcript details failed, trying legacy endpoint...', err);
        
        // Fallback to legacy transcript details
        try {
          const legacyData = await api.calls.getTranscriptById(transcriptSid);
          console.log('Legacy transcript details loaded:', legacyData);
          
          // Convert legacy data to enhanced format
          const convertedData: EnhancedTranscriptRecord = {
            transcript_sid: legacyData.transcript_sid,
            call_date: legacyData.date_created,
            duration: legacyData.duration,
            call_direction: 'outbound',
            scenario_name: 'Legacy Call',
            participant_info: {
              '0': {
                channel: 0,
                role: 'customer',
                name: 'Customer',
                total_speaking_time: Math.floor(legacyData.duration / 2),
                word_count: Math.floor((legacyData.full_text?.split(' ').length || 0) / 2),
                sentence_count: Math.floor((legacyData.full_text?.split('.').length || 0) / 2)
              },
              '1': {
                channel: 1,
                role: 'agent',
                name: 'AI Agent',
                total_speaking_time: Math.floor(legacyData.duration / 2),
                word_count: Math.floor((legacyData.full_text?.split(' ').length || 0) / 2),
                sentence_count: Math.floor((legacyData.full_text?.split('.').length || 0) / 2)
              }
            },
            conversation_flow: legacyData.full_text ? legacyData.full_text.split('.').filter(s => s.trim()).map((sentence, index) => ({
              sequence: index + 1,
              speaker: {
                channel: index % 2,
                role: index % 2 === 0 ? 'agent' : 'customer',
                name: index % 2 === 0 ? 'AI Agent' : 'Customer'
              },
              text: sentence.trim() + '.',
              start_time: (index * legacyData.duration) / legacyData.full_text.split('.').length,
              end_time: ((index + 1) * legacyData.duration) / legacyData.full_text.split('.').length,
              duration: legacyData.duration / legacyData.full_text.split('.').length,
              confidence: 0.85,
              word_count: sentence.trim().split(' ').length
            })) : [],
            summary_data: {
              total_duration_seconds: legacyData.duration,
              total_sentences: legacyData.full_text?.split('.').length || 0,
              total_words: legacyData.full_text?.split(' ').length || 0,
              participant_count: 2,
              average_confidence: 0.85,
              conversation_stats: {
                turns: legacyData.full_text?.split('.').length || 0,
                avg_words_per_turn: Math.floor((legacyData.full_text?.split(' ').length || 0) / (legacyData.full_text?.split('.').length || 1)),
                speaking_time_distribution: {
                  '0': { percentage: 50, seconds: Math.floor(legacyData.duration / 2) },
                  '1': { percentage: 50, seconds: Math.floor(legacyData.duration / 2) }
                }
              }
            },
            media_url: undefined,
            source_type: 'Legacy',
            status: legacyData.status,
            full_text: legacyData.full_text,
            date_created: legacyData.date_created,
            date_updated: legacyData.date_updated,
            language_code: legacyData.language_code,
            created_at: legacyData.created_at
          };
          
          setSelectedTranscript(convertedData);
          toast.success('Loaded legacy transcript details');
        } catch (legacyErr) {
          const message = legacyErr instanceof Error ? legacyErr.message : 'Failed to fetch transcript details';
          console.error('All transcript detail fetch methods failed:', legacyErr);
          toast.error(message);
          setError(message);
          setSelectedTranscript(null);
        }
      }
    } finally {
      setIsLoadingTranscript(false);
    }
  };

  const handleRefresh = () => {
    setCurrentPage(0);
    fetchTranscripts(0);
  };

  const loadMore = () => {
    if (!isLoading && hasMore) {
      fetchTranscripts(currentPage + 1);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatDuration = (duration: number) => {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Filter transcripts based on search term
  const filteredTranscripts = transcripts.filter(transcript => 
    transcript.transcript_sid.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
    transcript.scenario_name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
    formatDate(transcript.call_date).toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  );

  const getCallDirectionIcon = (direction: string) => {
    return direction === 'outbound' ? (
      <PhoneArrowUpRightIcon className="h-4 w-4 text-green-500" />
    ) : (
      <PhoneArrowDownLeftIcon className="h-4 w-4 text-blue-500" />
    );
  };

  const getSpeakerColor = (role: string) => {
    return role === 'agent' ? 'text-blue-600 dark:text-blue-400' : 'text-green-600 dark:text-green-400';
  };

  return (
    <PageContainer>
      <div className="border-b border-border-light dark:border-border-dark px-6 pb-6 pt-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-text-light dark:text-text-dark">
            Call Notes
          </h1>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        {debugInfo && (
          <div className="mt-2 text-sm text-blue-600 dark:text-blue-400">
            Debug: {debugInfo}
          </div>
        )}
      </div>

      <div className="flex h-[calc(100vh-12rem)]">
        {/* Sidebar */}
        <div className="w-80 border-r border-border-light dark:border-border-dark p-4 overflow-y-auto">
          {/* Search Input */}
          <div className="mb-4 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search transcripts..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>

          {/* Filters */}
          <div className="mb-4 space-y-2">
            <select
              value={filters.call_direction || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, call_direction: e.target.value || undefined }))}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
            >
              <option value="">All Directions</option>
              <option value="outbound">Outbound</option>
              <option value="inbound">Inbound</option>
            </select>
          </div>

          {isLoading && currentPage === 0 ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
          ) : error ? (
            <div className="text-red-500 text-center p-4">{error}</div>
          ) : filteredTranscripts.length === 0 ? (
            <div className="text-center text-gray-500 p-4">
              No call transcripts available
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTranscripts.map((transcript) => (
                <button
                  key={transcript.transcript_sid}
                  onClick={() => fetchTranscriptDetails(transcript.transcript_sid)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedTranscript?.transcript_sid === transcript.transcript_sid
                      ? 'bg-accent/10 text-accent'
                      : 'hover:bg-background-dark/5 dark:hover:bg-background-light/5'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {getCallDirectionIcon(transcript.call_direction)}
                    <div className="font-medium text-sm">
                      {transcript.scenario_name}
                    </div>
                  </div>
                  <div className="text-xs text-text-light/60 dark:text-text-dark/60">
                    {formatDate(transcript.call_date)}
                  </div>
                  <div className="text-xs text-text-light/60 dark:text-text-dark/60">
                    Duration: {formatDuration(transcript.duration)}
                  </div>
                  <div className="text-xs text-text-light/60 dark:text-text-dark/60">
                    {transcript.total_words} words • {transcript.participant_count} participants
                  </div>
                </button>
              ))}

              {hasMore && (
                <button
                  onClick={loadMore}
                  disabled={isLoading}
                  className="w-full py-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  {isLoading ? 'Loading...' : 'Load More'}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {isLoadingTranscript ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-red-500 text-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h3 className="text-lg font-semibold mb-2">Error Loading Transcript</h3>
                <p className="text-sm">{error}</p>
              </div>
              <button
                onClick={() => selectedTranscript && fetchTranscriptDetails(selectedTranscript.transcript_sid)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                disabled={!selectedTranscript?.transcript_sid}
              >
                Retry
              </button>
            </div>
          ) : selectedTranscript ? (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {getCallDirectionIcon(selectedTranscript.call_direction)}
                    <h2 className="text-xl font-semibold text-text-light dark:text-text-dark">
                      {selectedTranscript.scenario_name}
                    </h2>
                  </div>
                  <p className="text-sm text-text-light/60 dark:text-text-dark/60">
                    {formatDate(selectedTranscript.call_date)} • {formatDuration(selectedTranscript.duration)}
                  </p>
                  <p className="text-sm text-text-light/60 dark:text-text-dark/60">
                    Status: {selectedTranscript.status} • Confidence: {Math.round(selectedTranscript.summary_data.average_confidence * 100)}%
                  </p>
                </div>
              </div>

              {/* Call Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-background-light dark:bg-background-dark p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-text-light/60 dark:text-text-dark/60">Total Words</h3>
                  <p className="text-2xl font-semibold">{selectedTranscript.summary_data.total_words}</p>
                </div>
                <div className="bg-background-light dark:bg-background-dark p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-text-light/60 dark:text-text-dark/60">Conversation Turns</h3>
                  <p className="text-2xl font-semibold">{selectedTranscript.summary_data.conversation_stats.turns}</p>
                </div>
                <div className="bg-background-light dark:bg-background-dark p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-text-light/60 dark:text-text-dark/60">Participants</h3>
                  <p className="text-2xl font-semibold">{selectedTranscript.summary_data.participant_count}</p>
                </div>
              </div>

              {/* Participant Information */}
              <div className="bg-background-light dark:bg-background-dark p-6 rounded-lg">
                <h3 className="text-lg font-medium mb-4">Participants</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(selectedTranscript.participant_info).map(([channel, participant]) => (
                    <div key={channel} className="border border-gray-200 dark:border-gray-700 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-3 h-3 rounded-full ${participant.role === 'agent' ? 'bg-blue-500' : 'bg-green-500'}`} />
                        <h4 className="font-medium">{participant.name}</h4>
                        <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                          {participant.role}
                        </span>
                      </div>
                      <div className="text-sm text-text-light/60 dark:text-text-dark/60 space-y-1">
                        <p>Speaking time: {formatTime(participant.total_speaking_time)}</p>
                        <p>Words: {participant.word_count} • Sentences: {participant.sentence_count}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Conversation Flow */}
              <div className="bg-background-light dark:bg-background-dark p-6 rounded-lg">
                <h3 className="text-lg font-medium mb-4">Conversation</h3>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {selectedTranscript.conversation_flow.map((sentence, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="flex-shrink-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                          sentence.speaker.role === 'agent' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                        }`}>
                          {sentence.speaker.role === 'agent' ? 'AI' : 'C'}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-medium text-sm ${getSpeakerColor(sentence.speaker.role)}`}>
                            {sentence.speaker.name}
                          </span>
                          <span className="text-xs text-text-light/40 dark:text-text-dark/40">
                            {formatTime(sentence.start_time)}
                          </span>
                          <span className="text-xs text-text-light/40 dark:text-text-dark/40">
                            ({Math.round(sentence.confidence * 100)}%)
                          </span>
                        </div>
                        <p className="text-sm text-text-light dark:text-text-dark leading-relaxed">
                          {sentence.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Full Transcript (Fallback) */}
              {selectedTranscript.full_text && (
                <div className="bg-background-light dark:bg-background-dark p-6 rounded-lg">
                  <h3 className="text-lg font-medium mb-4">Full Transcript</h3>
                  <p className="whitespace-pre-wrap text-text-light dark:text-text-dark leading-relaxed text-sm">
                    {selectedTranscript.full_text}
                  </p>
                </div>
              )}

              <div className="text-sm text-text-light/60 dark:text-text-dark/60 mt-4">
                <p>Source: {selectedTranscript.source_type}</p>
                <p>Language: {selectedTranscript.language_code}</p>
                <p>Last Updated: {formatDate(selectedTranscript.date_updated)}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-text-light/60 dark:text-text-dark/60">
              Select a call from the sidebar to view its enhanced transcript
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}; 