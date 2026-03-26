'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface QuizTimerProps {
  minutes: number;
  onTimeUp: () => void;
}

export function QuizTimer({ minutes, onTimeUp }: QuizTimerProps) {
  const [timeLeft, setTimeLeft] = useState(minutes * 60);
  const [isWarning, setIsWarning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onTimeUp]);

  // Check if we're in warning zone (less than 5 minutes)
  useEffect(() => {
    setIsWarning(timeLeft < 300);
  }, [timeLeft]);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const percentage = (timeLeft / (minutes * 60)) * 100;

  return (
    <div className="space-y-2">
      {isWarning && timeLeft > 0 && (
        <Alert variant="destructive" className="py-2">
          <AlertDescription className="text-sm">
            Time is running out! {mins}:{secs.toString().padStart(2, '0')} remaining
          </AlertDescription>
        </Alert>
      )}
      <Card className="bg-background">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Time Remaining</span>
            <span
              className={`text-2xl font-bold ${
                isWarning && timeLeft > 0 ? 'text-destructive' : 'text-foreground'
              }`}
            >
              {mins}:{secs.toString().padStart(2, '0')}
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all ${
                isWarning && timeLeft > 0 ? 'bg-destructive' : 'bg-primary'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
