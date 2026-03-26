'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 px-4">
      <div className="text-center space-y-8 max-w-2xl">
        <div className="space-y-2">
          <h1 className="text-5xl font-bold text-foreground">Quiz Room</h1>
          <p className="text-xl text-muted-foreground">
            Interactive quiz platform for learning and assessment
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-12">
          {/* Admin Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>For Instructors</CardTitle>
              <CardDescription>Create and manage quizzes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Create custom quizzes, set time limits, and track student performance in real-time.
              </p>
              <Link href="/admin/login" className="block">
                <Button className="w-full" size="lg">
                  Admin Login
                </Button>
              </Link>
              <p className="text-xs text-muted-foreground text-center">
                or{' '}
                <Link href="/admin/signup" className="text-primary hover:underline font-medium">
                  create an account
                </Link>
              </p>
            </CardContent>
          </Card>

          {/* Student Card */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>For Students</CardTitle>
              <CardDescription>Take quizzes and view results</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Join a quiz using the quiz ID, answer questions, and get instant feedback on your performance.
              </p>
              <Link href="/join" className="block">
                <Button className="w-full" variant="outline" size="lg">
                  Join a Quiz
                </Button>
              </Link>
              <p className="text-xs text-muted-foreground text-center">
                or{' '}
                <Link href="/student/login" className="text-primary hover:underline font-medium">
                  login with your account
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="pt-8 text-center text-sm text-muted-foreground">
          <p>© 2024 Quiz Room. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
