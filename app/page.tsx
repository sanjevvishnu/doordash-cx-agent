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
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import { RefreshCw, LayoutDashboard, MessageSquare, BarChart3, Settings, Phone } from "lucide-react";



interface Conversation {
  id?: string;
  conversation_id?: string;
  customer_name: string | null;
  agent_name: string | null;
  status: string;
  started_at: string | null;
  ended_at: string | null;
  created_at?: string;
  transcript?: Array<{
    role: string;
    message: string;
  }>;
}

export default function Home() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  // Calculate KPIs
  const totalConversations = conversations.length;
  const completedConversations = conversations.filter(c => c.status === 'completed').length;
  const activeConversations = conversations.filter(c => c.status === 'active').length;
  const avgDuration = conversations.length > 0
    ? conversations
        .filter(c => c.started_at && c.ended_at)
        .reduce((acc, c) => {
          const start = new Date(c.started_at!).getTime();
          const end = new Date(c.ended_at!).getTime();
          return acc + (end - start) / 1000; // in seconds
        }, 0) / conversations.filter(c => c.started_at && c.ended_at).length
    : 0;

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
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        {/* Sidebar */}
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>DoorDash CX Agent</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="/">
                        <LayoutDashboard className="w-4 h-4" />
                        <span>Dashboard</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="#conversations">
                        <MessageSquare className="w-4 h-4" />
                        <span>Conversations</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="#analytics">
                        <BarChart3 className="w-4 h-4" />
                        <span>Analytics</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="#agent">
                        <Phone className="w-4 h-4" />
                        <span>Test Agent</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="#settings">
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
            <SidebarTrigger />
            <div className="flex-1">
              <h1 className="text-2xl font-bold">DoorDash CX Agent Dashboard</h1>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800">
            <div className="container mx-auto px-4 py-8">
              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Conversations</CardTitle>
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalConversations}</div>
                    <p className="text-xs text-muted-foreground">All time</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Completed</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{completedConversations}</div>
                    <p className="text-xs text-muted-foreground">
                      {totalConversations > 0
                        ? `${Math.round((completedConversations / totalConversations) * 100)}% completion rate`
                        : 'No data'}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active</CardTitle>
                    <Phone className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{activeConversations}</div>
                    <p className="text-xs text-muted-foreground">In progress</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {avgDuration > 0 ? `${Math.round(avgDuration)}s` : 'N/A'}
                    </div>
                    <p className="text-xs text-muted-foreground">Per conversation</p>
                  </CardContent>
                </Card>
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
                    {conversations.map((conv) => {
                      const conversationId = conv.conversation_id || conv.id || '';
                      return (
                        <TableRow key={conversationId}>
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
                              onClick={() => fetchConversationDetails(conversationId)}
                              variant="ghost"
                              size="sm"
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
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
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
