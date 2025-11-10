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


type IssueType = "dasher" | "merchant" | "customer";

interface Conversation {
  conversation_id: string;
  agent_id: string;
  status: string;
  metadata?: {
    classification?: IssueType;
  };
  transcript?: Array<{
    role: string;
    message: string;
  }>;
  created_at?: string;
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
  }, []);

  const getClassificationBadge = (type?: IssueType) => {
    if (!type) return <Badge variant="outline">Unknown</Badge>;

    const colors = {
      dasher: "bg-blue-500 text-white",
      merchant: "bg-purple-500 text-white",
      customer: "bg-green-500 text-white",
    };

    return (
      <Badge className={colors[type]}>
        {type.toUpperCase()}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      done: "bg-green-100 text-green-800",
      in_progress: "bg-yellow-100 text-yellow-800",
      initiated: "bg-blue-100 text-blue-800",
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
                      <TableHead>Conversation ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Classification</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {conversations.map((conv) => (
                      <TableRow key={conv.conversation_id}>
                        <TableCell className="font-mono text-xs">
                          {conv.conversation_id.substring(0, 20)}...
                        </TableCell>
                        <TableCell>{getStatusBadge(conv.status)}</TableCell>
                        <TableCell>
                          {getClassificationBadge(conv.metadata?.classification)}
                        </TableCell>
                        <TableCell>
                          {conv.created_at
                            ? new Date(conv.created_at).toLocaleString()
                            : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Button
                            onClick={() => fetchConversationDetails(conv.conversation_id)}
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
                    <p className="text-sm text-gray-500 mt-1 font-mono">
                      {selectedConversation.conversation_id}
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
                  {getClassificationBadge(selectedConversation.metadata?.classification)}
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

                {selectedConversation.metadata && (
                  <div>
                    <h3 className="font-semibold mb-2">Metadata:</h3>
                    <pre className="text-xs bg-gray-50 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
                      {JSON.stringify(selectedConversation.metadata, null, 2)}
                    </pre>
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
