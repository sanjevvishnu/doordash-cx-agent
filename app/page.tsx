"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Phone, PhoneOff, Mic, MicOff } from "lucide-react";

type IssueType = "dasher" | "merchant" | "customer" | null;

interface Classification {
  dasher: number;
  merchant: number;
  customer: number;
}

export default function Home() {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);
  const [classification, setClassification] = useState<Classification>({
    dasher: 0,
    merchant: 0,
    customer: 0,
  });
  const [finalIssueType, setFinalIssueType] = useState<IssueType>(null);

  const startCall = () => {
    setIsCallActive(true);
    setTranscript([]);
    setClassification({ dasher: 0, merchant: 0, customer: 0 });
    setFinalIssueType(null);
    // ElevenLabs integration will go here
  };

  const endCall = () => {
    setIsCallActive(false);
    setIsSpeaking(false);
    // Determine final classification
    const maxType = Object.entries(classification).reduce((a, b) =>
      b[1] > a[1] ? b : a
    )[0] as IssueType;
    setFinalIssueType(maxType);
  };

  const getClassificationColor = (type: string) => {
    if (type === "dasher") return "bg-blue-500";
    if (type === "merchant") return "bg-purple-500";
    if (type === "customer") return "bg-green-500";
    return "bg-gray-300";
  };

  const getIssueTypeBadgeVariant = (type: IssueType) => {
    if (type === "dasher") return "default";
    if (type === "merchant") return "secondary";
    if (type === "customer") return "outline";
    return "default";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            DoorDash Support Triage
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            AI-powered voice agent for intelligent support routing
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Main Call Interface */}
          {!isCallActive && !finalIssueType && (
            <Card className="border-2">
              <CardHeader className="text-center">
                <CardTitle>Welcome to DoorDash Support</CardTitle>
                <CardDescription>
                  Start a call and describe your issue. Our AI agent will classify and route your request to the right team.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4">
                <div className="flex flex-col items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Badge variant="outline" className="bg-blue-50">Dasher Issues</Badge>
                  <Badge variant="outline" className="bg-purple-50">Merchant Issues</Badge>
                  <Badge variant="outline" className="bg-green-50">Customer Issues</Badge>
                </div>
                <Button
                  onClick={startCall}
                  size="lg"
                  className="bg-orange-600 hover:bg-orange-700 text-white gap-2"
                >
                  <Phone className="w-5 h-5" />
                  Start Support Call
                </Button>
                <p className="text-xs text-gray-500">Microphone access required</p>
              </CardContent>
            </Card>
          )}

          {/* Active Call Interface */}
          {isCallActive && (
            <>
              {/* Voice Indicator */}
              <Card>
                <CardContent className="py-8">
                  <div className="flex flex-col items-center gap-4">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center ${
                      isSpeaking
                        ? "bg-orange-500 animate-pulse"
                        : "bg-gray-300"
                    }`}>
                      {isSpeaking ? (
                        <Mic className="w-12 h-12 text-white" />
                      ) : (
                        <MicOff className="w-12 h-12 text-gray-600" />
                      )}
                    </div>
                    <p className="text-lg font-medium">
                      {isSpeaking ? "Agent is listening..." : "Speak now"}
                    </p>
                    <Button
                      onClick={endCall}
                      variant="destructive"
                      className="gap-2"
                    >
                      <PhoneOff className="w-4 h-4" />
                      End Call
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Real-time Classification */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Real-time Classification</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(classification).map(([type, probability]) => (
                    <div key={type} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="capitalize font-medium">{type} Issue</span>
                        <span className="text-gray-600">{probability}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${getClassificationColor(type)}`}
                          style={{ width: `${probability}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Live Transcript */}
              {transcript.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Conversation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {transcript.map((line, index) => (
                        <p key={index} className="text-sm text-gray-700 dark:text-gray-300">
                          {line}
                        </p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Results After Call */}
          {!isCallActive && finalIssueType && (
            <>
              <Card className="border-2 border-orange-500">
                <CardHeader className="text-center">
                  <CardTitle>Issue Classified</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-6">
                  <Badge
                    variant={getIssueTypeBadgeVariant(finalIssueType)}
                    className="text-2xl py-2 px-6 uppercase"
                  >
                    {finalIssueType} Issue
                  </Badge>

                  <div className="w-full space-y-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <h3 className="font-semibold mb-2">Next Steps:</h3>
                      <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                        {finalIssueType === "dasher" && (
                          <>
                            <li>• Connecting you to Dasher Support Team</li>
                            <li>• Average wait time: 2-3 minutes</li>
                            <li>• Have your Dasher ID ready</li>
                          </>
                        )}
                        {finalIssueType === "merchant" && (
                          <>
                            <li>• Routing to Merchant Success Team</li>
                            <li>• Average wait time: 3-5 minutes</li>
                            <li>• Have your Store ID ready</li>
                          </>
                        )}
                        {finalIssueType === "customer" && (
                          <>
                            <li>• Transferring to Customer Support</li>
                            <li>• Average wait time: 1-2 minutes</li>
                            <li>• Have your Order ID ready if applicable</li>
                          </>
                        )}
                      </ul>
                    </div>

                    {transcript.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Call Transcript</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 max-h-48 overflow-y-auto text-sm">
                            {transcript.map((line, index) => (
                              <p key={index} className="text-gray-700 dark:text-gray-300">
                                {line}
                              </p>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  <Button
                    onClick={() => {
                      setFinalIssueType(null);
                      setTranscript([]);
                      setClassification({ dasher: 0, merchant: 0, customer: 0 });
                    }}
                    className="w-full bg-orange-600 hover:bg-orange-700"
                  >
                    Start New Call
                  </Button>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Footer Info */}
        <div className="text-center mt-8 text-sm text-gray-600 dark:text-gray-400">
          <p>Demo built for DoorDash CX • Powered by ElevenLabs AI</p>
        </div>
      </div>
    </div>
  );
}
