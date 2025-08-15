import { Arrow } from '@radix-ui/react-context-menu'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

function NotFoudPage() {
  return (
    <div className="flex flex-col items-center justify-centwer min-h-screen p-4">
        <div className='text-center'>
            <h1 className="text-6x1 font-bold text-primary mb-4">404</h1>
            <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
            <p className='text-muted-foreground mb-8 max-w-md'>
                Don&apos;t worry, even the best of us make mistakes. The page you
                 are looking for might have been removed, had its name changed, 
                 or is temporarily unavailable.
            </p>
            <div className='flex flex-col sm:flex-row justify-center gap-4'>
                <Link
                    href="/"
                    className="flex items-center justify-centwer px-4 py-2 bg-primary text-white 
                    rounded-md hover:bg:primary/80 transition-colors"
                >
                    <ArrowLeft className='w-4 h-4 mr-2' />
                    Back to Dashboard
                </Link>
            </div>
        </div>
        <div>
            <footer className='mt-12 text-center text-sm text-muted-foreground'>
                If you think this is a mistake, please contact support.
            </footer>
        </div>
    </div>
  )
}

export default NotFoudPage