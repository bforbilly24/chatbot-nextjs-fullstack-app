"use client"

import React, { useEffect, useRef, useState, useCallback } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Paperclip, Square } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAutosizeTextArea } from "@/hooks/use-autosize-textarea"
import { Button } from "@/components/ui/button"
import { SendIcon } from "@/components/icons"

interface ChatGPTInputProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onSubmit'> {
    value: string
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
    submitOnEnter?: boolean
    stop?: () => void
    isGenerating: boolean
    allowAttachments?: boolean
    onFileSelect?: (files: File[]) => void
    placeholders?: string[]
}

const defaultPlaceholders = [
    "Ask me anything...",
    "What would you like to know?",
    "Type your message here...",
    "How can I help you today?",
    "Start a conversation...",
    "Ask me to explain something...",
    "What are you curious about?",
    "Let's chat about...",
]

export function ChatGPTInput({
    placeholder = "Message ChatGPT...",
    className,
    onKeyDown: onKeyDownProp,
    submitOnEnter = true,
    stop,
    isGenerating,
    allowAttachments = false,
    onFileSelect,
    onSubmit,
    placeholders = defaultPlaceholders,
    ...props
}: ChatGPTInputProps) {
    const [currentPlaceholder, setCurrentPlaceholder] = useState(0)
    const [animating, setAnimating] = useState(false)
    const [isMultiline, setIsMultiline] = useState(false)
    const textAreaRef = useRef<HTMLTextAreaElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const newDataRef = useRef<any[]>([])
    const intervalRef = useRef<NodeJS.Timeout | null>(null)


    const startAnimation = () => {
        intervalRef.current = setInterval(() => {
            setCurrentPlaceholder((prev) => (prev + 1) % placeholders.length)
        }, 3000)
    }

    const handleVisibilityChange = () => {
        if (document.visibilityState !== "visible" && intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
        } else if (document.visibilityState === "visible") {
            startAnimation()
        }
    }

    useEffect(() => {
        startAnimation()
        document.addEventListener("visibilitychange", handleVisibilityChange)

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
            document.removeEventListener("visibilitychange", handleVisibilityChange)
        }
    }, [placeholders])


    const draw = useCallback(() => {
        if (!textAreaRef.current) return
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        canvas.width = 800
        canvas.height = 800
        ctx.clearRect(0, 0, 800, 800)
        const computedStyles = getComputedStyle(textAreaRef.current)

        const fontSize = parseFloat(computedStyles.getPropertyValue("font-size"))
        ctx.font = `${fontSize * 2}px ${computedStyles.fontFamily}`
        ctx.fillStyle = "#FFF"
        ctx.fillText(props.value, 16, 40)

        const imageData = ctx.getImageData(0, 0, 800, 800)
        const pixelData = imageData.data
        const newData: any[] = []

        for (let t = 0; t < 800; t++) {
            let i = 4 * t * 800
            for (let n = 0; n < 800; n++) {
                let e = i + 4 * n
                if (
                    pixelData[e] !== 0 &&
                    pixelData[e + 1] !== 0 &&
                    pixelData[e + 2] !== 0
                ) {
                    newData.push({
                        x: n,
                        y: t,
                        color: [
                            pixelData[e],
                            pixelData[e + 1],
                            pixelData[e + 2],
                            pixelData[e + 3],
                        ],
                    })
                }
            }
        }

        newDataRef.current = newData.map(({ x, y, color }) => ({
            x,
            y,
            r: 1,
            color: `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3]})`,
        }))
    }, [props.value])

    const animate = (start: number) => {
        const animateFrame = (pos: number = 0) => {
            requestAnimationFrame(() => {
                const newArr = []
                for (let i = 0; i < newDataRef.current.length; i++) {
                    const current = newDataRef.current[i]
                    if (current.x < pos) {
                        newArr.push(current)
                    } else {
                        if (current.r <= 0) {
                            current.r = 0
                            continue
                        }
                        current.x += Math.random() > 0.5 ? 1 : -1
                        current.y += Math.random() > 0.5 ? 1 : -1
                        current.r -= 0.05 * Math.random()
                        newArr.push(current)
                    }
                }
                newDataRef.current = newArr
                const ctx = canvasRef.current?.getContext("2d")
                if (ctx) {
                    ctx.clearRect(pos, 0, 800, 800)
                    newDataRef.current.forEach((t) => {
                        const { x: n, y: i, r: s, color: color } = t
                        if (n > pos) {
                            ctx.beginPath()
                            ctx.rect(n, i, s, s)
                            ctx.fillStyle = color
                            ctx.fill()
                        }
                    })
                }
                if (newDataRef.current.length > 0) {
                    animateFrame(pos - 8)
                } else {
                    setAnimating(false)
                }
            })
        }
        animateFrame(start)
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === "Enter") {
            if (event.shiftKey) {
                return
            }

            if (submitOnEnter) {
                event.preventDefault()
                vanishAndSubmit()
            }
        }
        onKeyDownProp?.(event)
    }

    const vanishAndSubmit = () => {
        const value = textAreaRef.current?.value || ""

        if (!value.trim()) {
            return
        }

        setAnimating(true)
        draw()

        if (textAreaRef.current) {
            const maxX = newDataRef.current.reduce(
                (prev, current) => (current.x > prev ? current.x : prev),
                0
            )
            animate(maxX)
        }


        const syntheticEvent = {
            preventDefault: () => { },
            target: textAreaRef.current,
            currentTarget: textAreaRef.current,
        } as unknown as React.FormEvent<HTMLFormElement>

        onSubmit(syntheticEvent)
    }

    const handleFileSelect = () => {
        fileInputRef.current?.click()
    }

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || [])
        if (files.length > 0 && onFileSelect) {
            onFileSelect(files)
        }
    }


    useAutosizeTextArea({
        ref: textAreaRef,
        maxHeight: 200,
        borderWidth: 1,
        dependencies: [props.value],
    })


    useEffect(() => {
        if (textAreaRef.current) {
            const textarea = textAreaRef.current
            const hasLineBreaks = props.value.includes('\n')
            const scrollHeight = textarea.scrollHeight


            const isCurrentlyMultiline = hasLineBreaks || scrollHeight > 48
            setIsMultiline(isCurrentlyMultiline)

            if (!hasLineBreaks && props.value.length < 150) {

                textarea.style.height = '48px'
            }
        }
    }, [props.value])

    const isDisabled = props.value === "" || isGenerating

    return (
        <div className="relative flex w-full">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                multiple
                className="hidden"
                accept="*/*"
            />

            <div className="relative w-full">
                <div className={cn(
                    "relative h-fit rounded-xl border border-input bg-background shadow-sm transition-colors focus-within:border-primary",
                    "overflow-hidden"
                )}>
                    {/* Canvas for vanish animation */}
                    <canvas
                        className={cn(
                            "absolute pointer-events-none text-base transform scale-50 top-[20%] left-2 sm:left-8 origin-top-left filter invert dark:invert-0 pr-20 z-30",
                            !animating ? "opacity-0" : "opacity-100"
                        )}
                        ref={canvasRef}
                    />

                    {/* Textarea */}
                    <textarea
                        ref={textAreaRef}
                        onKeyDown={handleKeyDown}
                        className={cn(
                            "w-full resize-none border-0 bg-transparent px-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
                            "leading-6",
                            isMultiline ? "py-3" : "py-0 h-12 flex items-center",
                            allowAttachments ? "pr-20" : "pr-12",
                            animating && "text-transparent dark:text-transparent",
                            className
                        )}
                        style={{
                            scrollbarWidth: "none",
                            msOverflowStyle: "none",
                            minHeight: "48px",
                            display: isMultiline ? "block" : "flex",
                            alignItems: isMultiline ? "unset" : "center",
                        }}
                        {...props}
                    />

                    {/* Animated placeholder */}
                    <div className={cn(
                        "absolute top-0 left-0 right-0 flex items-center px-3 pointer-events-none",
                        isMultiline ? "py-3" : "h-12"
                    )}>
                        <AnimatePresence mode="wait">
                            {!props.value && (
                                <motion.p
                                    initial={{ y: 5, opacity: 0 }}
                                    key={`current-placeholder-${currentPlaceholder}`}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -15, opacity: 0 }}
                                    transition={{ duration: 0.3, ease: "linear" }}
                                    className="text-muted-foreground text-sm leading-6 truncate w-[calc(100%-4rem)]"
                                >
                                    {placeholders[currentPlaceholder]}
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Action buttons inside input */}
                    <div className={cn(
                        "absolute right-2 flex items-center gap-1 transition-all duration-200",
                        isMultiline
                            ? "bottom-2"
                            : "top-1/2 transform -translate-y-1/2"
                    )}>
                        {allowAttachments && (
                            <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                className="size-8 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-700"
                                onClick={handleFileSelect}
                                disabled={isGenerating}
                            >
                                <Paperclip className="h-4 w-4" />
                            </Button>
                        )}

                        {isGenerating && stop ? (
                            <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                className="size-8 rounded-lg bg-red-500 hover:bg-red-600 text-white"
                                onClick={stop}
                            >
                                <Square className="size-3" fill="currentColor" />
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                className={cn(
                                    "size-8 rounded-lg transition-opacity",
                                    isDisabled
                                        ? "text-gray-400 cursor-not-allowed"
                                        : "text-white bg-black hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                                )}
                                onClick={vanishAndSubmit}
                                disabled={isDisabled}
                            >
                                <SendIcon size={16} />
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

ChatGPTInput.displayName = "ChatGPTInput"
