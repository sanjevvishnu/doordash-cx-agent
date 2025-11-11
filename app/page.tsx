"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";



interface Conversation {
  id: string;
  customer_name: string | null;
  agent_name: string | null;
  status: string;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
  transcript?: Array<{
    role: string;
    message: string;
  }>;
}

export default function Home() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/conversations');
      const data = await response.json();

      if (data.conversations) {
        setConversations(data.conversations);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchConversationDetails = async (id: string) => {
    try {
      const response = await fetch(`/api/conversations?id=${id}`);
      const data = await response.json();
      setSelectedConversation(data);
    } catch (error) {
      console.error('Error fetching conversation details:', error);
    }
  };

  useEffect(() => {
    fetchConversations();

    // Listen for conversation end events from ElevenLabs widget
    const handleConversationEnd = async (event: any) => {
      console.log('Conversation ended:', event.detail);
      const conversationId = event.detail?.conversationId;

      if (conversationId) {
        // Fetch and save the conversation after it ends
        try {
          await fetch(`/api/conversations?id=${conversationId}`);
          // Refresh the conversations list
          setTimeout(() => fetchConversations(), 2000);
        } catch (error) {
          console.error('Error saving conversation:', error);
        }
      }
    };

    window.addEventListener('elevenlabs:conversation-ended', handleConversationEnd);

    return () => {
      window.removeEventListener('elevenlabs:conversation-ended', handleConversationEnd);
    };
  }, []);

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-yellow-100 text-yellow-800",
      completed: "bg-green-100 text-green-800",
      escalated: "bg-red-100 text-red-800",
    };

    return (
      <Badge variant="outline" className={colors[status] || ""}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            DoorDash CX Agent Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            AI-powered voice agent for intelligent support routing
          </p>
        </div>

        {/* ElevenLabs Widget */}
        <div className="max-w-4xl mx-auto mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Talk to Support Agent</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div
                id="elevenlabs-widget"
                dangerouslySetInnerHTML={{
                  __html: '<elevenlabs-convai agent-id="agent_7701k9qkzfhwfsntakrxdn982sp2"></elevenlabs-convai>'
                }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Conversations Table */}
        <div className="max-w-6xl mx-auto">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Conversations</CardTitle>
              <Button
                onClick={fetchConversations}
                disabled={loading}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </CardHeader>
            <CardContent>
              {conversations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No conversations yet. Start a call to see data here.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Agent</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Started At</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {conversations.map((conv) => (
                      <TableRow key={conv.id}>
                        <TableCell>
                          {conv.customer_name || 'Anonymous'}
                        </TableCell>
                        <TableCell>
                          {conv.agent_name || 'N/A'}
                        </TableCell>
                        <TableCell>{getStatusBadge(conv.status)}</TableCell>
                        <TableCell>
                          {conv.started_at
                            ? new Date(conv.started_at).toLocaleString()
                            : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Button
                            onClick={() => fetchConversationDetails(conv.id)}
                            variant="ghost"
                            size="sm"
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Conversation Details Modal */}
        {selectedConversation && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Conversation Details</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      {selectedConversation.customer_name || 'Anonymous'} • {selectedConversation.agent_name || 'N/A'}
                    </p>
                  </div>
                  <Button
                    onClick={() => setSelectedConversation(null)}
                    variant="ghost"
                    size="sm"
                  >
                    Close
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  {getStatusBadge(selectedConversation.status)}
                </div>

                {selectedConversation.transcript && selectedConversation.transcript.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Transcript:</h3>
                    <div className="space-y-2 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      {selectedConversation.transcript.map((turn, idx) => (
                        <div key={idx} className="text-sm">
                          <span className="font-medium capitalize">{turn.role}:</span>{' '}
                          {turn.message}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-600 dark:text-gray-400">
          <p>Demo built for DoorDash CX • Powered by ElevenLabs AI</p>
        </div>
      </div>
    </div>
  );
}
