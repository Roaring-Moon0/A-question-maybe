'use client';

import { Heart } from 'lucide-react';

const HeartIcon = ({ style }: { style: React.CSSProperties }) => (
    <Heart 
        className="absolute text-primary/30"
        style={style}
        fill="currentColor"
        strokeWidth={0}
    />
);

export function FloatingHearts() {
    const hearts = Array.from({ length: 15 }).map((_, i) => {
        const style = {
            left: `${Math.random() * 100}%`,
            animationDuration: `${Math.random() * 5 + 5}s`,
            animationDelay: `${Math.random() * 5}s`,
            width: `${Math.random() * 20 + 10}px`,
            height: `${Math.random() * 20 + 10}px`,
        };
        return <HeartIcon key={i} style={style} />;
    });

    return (
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[-1] overflow-hidden">
            <style jsx>{`
                @keyframes float {
                    0% {
                        transform: translateY(100vh) rotate(0deg);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(-10vh) rotate(720deg);
                        opacity: 0;
                    }
                }
                div > :global(svg) {
                    animation: float linear infinite;
                }
            `}</style>
            {hearts}
        </div>
    );
}
