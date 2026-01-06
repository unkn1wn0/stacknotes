'use client';

import { useEffect, useRef } from 'react';
import { usePageStore } from '@/stores/pageStore';

export function GraphView({ width = 240, height = 200 }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { pages } = usePageStore();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set high DPI scale
        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        // Nodes setup
        // For now, randomly distribute nodes if there are no real links
        // In a real implementation, we'd use a force-directed layout
        const nodes = pages.map((page, i) => ({
            id: page.id,
            x: Math.random() * (width - 40) + 20,
            y: Math.random() * (height - 40) + 20,
            color: '#8b5cf6', // Violet
            radius: 4,
        }));

        // Connections (mock for now, or link sequential pages to look "connected")
        const links: { source: any; target: any }[] = [];
        for (let i = 0; i < nodes.length - 1; i++) {
            if (Math.random() > 0.5) {
                links.push({
                    source: nodes[i],
                    target: nodes[Math.floor(Math.random() * nodes.length)],
                });
            }
        }

        const animate = () => {
            // physics simulation steps could go here
        };

        const draw = () => {
            ctx.clearRect(0, 0, width, height);

            // Draw links
            ctx.strokeStyle = 'rgba(139, 92, 246, 0.2)';
            ctx.lineWidth = 1;
            links.forEach((link) => {
                ctx.beginPath();
                ctx.moveTo(link.source.x, link.source.y);
                ctx.lineTo(link.target.x, link.target.y);
                ctx.stroke();
            });

            // Draw nodes
            nodes.forEach((node) => {
                // Glow
                const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.radius * 3);
                gradient.addColorStop(0, 'rgba(139, 92, 246, 0.4)');
                gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(node.x, node.y, node.radius * 3, 0, Math.PI * 2);
                ctx.fill();

                // Core
                ctx.fillStyle = node.color;
                ctx.beginPath();
                ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
                ctx.fill();
            });
        };

        // Simple loop
        let frame = 0;
        const loop = () => {
            // Subtle movement
            nodes.forEach((node) => {
                node.x += Math.sin(frame * 0.01 + node.id.charCodeAt(0)) * 0.1;
                node.y += Math.cos(frame * 0.01 + node.id.charCodeAt(0)) * 0.1;
            });
            draw();
            frame++;
            requestAnimationFrame(loop);
        };

        const animationId = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(animationId);
    }, [pages, width, height]);

    return (
        <div
            className="graph-view-container"
            style={{
                width,
                height,
                background: 'var(--bg-secondary)',
                borderBottom: '1px solid var(--border-light)',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <canvas ref={canvasRef} />
        </div>
    );
}
