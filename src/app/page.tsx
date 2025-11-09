
'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { generateRomanticMessage, type RomanticMessageInput } from '@/ai/flows/generate-romantic-message';
import { saveProposalResponse } from '@/app/actions';
import { useToast } from '@/components/ui/use-toast';
import { Heart, Smile, Wand2, Wind, Sparkles, User, Brain, Star, Feather, Edit, Gift, Camera } from 'lucide-react';
import { cn } from "@/lib/utils";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ScrollArea } from '@/components/ui/scroll-area';

import { FloatingHearts } from '@/components/heartfelt-unveiling/floating-hearts';
import { Typewriter } from '@/components/heartfelt-unveiling/typewriter';
import { Confetti } from '@/components/heartfelt-unveiling/confetti';

const formSchema = z.object({
  favoriteMemory: z.string().min(10, 'Tell me more about this beautiful memory.'),
  personality: z.string().min(2, 'Just one word is enough!'),
  emotion: z.string().min(1, 'How do I make you feel?'),
  tone: z.enum(['Poetic', 'Flirty', 'Silly']),
  favoriteThing: z.string().min(10, 'I know there is something you love about me!'),
});

type FormValues = z.infer<typeof formSchema>;
type ProposalStatus = 'pending' | 'yes' | 'no';

const SectionWrapper = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.3 }}
    transition={{ duration: 0.8, ease: "easeOut" }}
    className={cn("min-h-screen w-full flex flex-col items-center justify-center text-center p-4", className)}
  >
    {children}
  </motion.div>
);

const AnimatedFormItem = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7, ease: 'easeOut', delay }}
      className="w-full"
    >
      {children}
    </motion.div>
  );

export default function HeartfeltPage() {
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showObservations, setShowObservations] = useState(false);
  const [proposalStatus, setProposalStatus] = useState<ProposalStatus>('pending');
  const [noCount, setNoCount] = useState(0);
  const [noPosition, setNoPosition] = useState({ x: 0, y: 0 });
  const [isDodging, setIsDodging] = useState(true);
  const noButtonRef = useRef<HTMLButtonElement>(null);
  const proposalContainerRef = useRef<HTMLDivElement>(null);

  const { toast } = useToast();

  const sectionRefs = {
    intro: useRef<HTMLDivElement>(null),
    formIntro: useRef<HTMLDivElement>(null),
    form: useRef<HTMLDivElement>(null),
    observations: useRef<HTMLDivElement>(null),
    reveal: useRef<HTMLDivElement>(null),
    proposal: useRef<HTMLDivElement>(null),
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      favoriteMemory: '',
      personality: '',
      emotion: '❤️',
      tone: 'Poetic',
      favoriteThing: '',
    },
    mode: 'onChange',
  });

  const scrollToRef = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleGenerateMessage = async () => {
    const isValid = await form.trigger();
    if (!isValid) {
      toast({
        title: 'A Little More... 💌',
        description: 'Please fill out all the fields to create your perfect message.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    setShowObservations(true);
    setTimeout(() => scrollToRef(sectionRefs.observations), 100);

    try {
      const values = form.getValues();
      const input: RomanticMessageInput = { ...values };
      const result = await generateRomanticMessage(input);
      setGeneratedMessage(result.message);
      setTimeout(() => scrollToRef(sectionRefs.reveal), 5000); 
    } catch (error) {
      console.error(error);
      toast({
        title: 'An error occurred',
        description: 'Could not generate the message. Please try again.',
        variant: 'destructive',
      });
      setShowObservations(false);
      scrollToRef(sectionRefs.form);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleProposalResponse = async (response: 'yes' | 'no') => {
    setProposalStatus(response);
    try {
        await saveProposalResponse({
            ...form.getValues(),
            message: generatedMessage,
            response,
            timestamp: new Date(),
        });
    } catch (error) {
        console.error("Failed to save response:", error);
        toast({ title: "Couldn't save the moment", description: "But don't worry, it's forever in our hearts." });
    }
  };

  const handleNoInteraction = () => {
    if (!isDodging || !proposalContainerRef.current || !noButtonRef.current) return;

    setNoCount(c => c + 1);
    if (noCount >= 9) {
      setIsDodging(false);
      return;
    }

    const container = proposalContainerRef.current.getBoundingClientRect();
    const button = noButtonRef.current.getBoundingClientRect();
    const newX = Math.random() * (container.width - button.width);
    const newY = Math.random() * (container.height - button.height);
    setNoPosition({ x: newX, y: newY });
  };

  const emotionEmojis = useMemo(() => [
    { emoji: '💫', label: 'Dazzled' },
    { emoji: '🥹', label: 'Emotional' },
    { emoji: '❤️', label: 'Full of Love' },
    { emoji: '🔥', label: 'Passionate' },
    { emoji: '☀️', label: 'Radiant' }
  ], []);

  const toneOptions = useMemo(() => [
    { value: 'Poetic', icon: Feather, label: 'Poetic' },
    { value: 'Flirty', icon: Wand2, label: 'Flirty' },
    { value: 'Silly', icon: Smile, label: 'Silly' }
  ], []);

  const ObservationItem = ({ text, delay }: { text: React.ReactNode, delay: number }) => (
    <motion.p 
        className="text-lg md:text-xl font-quote text-foreground/90 mb-4"
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay, duration: 1.5 }}
    >
        {text}
    </motion.p>
  );

  return (
    <AnimatePresence>
      {proposalStatus === 'pending' && (
        <motion.main key="form" exit={{ opacity: 0 }} className="w-full max-w-2xl mx-auto">
          <FloatingHearts />
          
          <div ref={sectionRefs.intro}>
            <SectionWrapper>
              <h1 className="text-5xl md:text-7xl font-bold text-shadow mb-4 font-headline">A Message from the Heart</h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8">Let’s create something beautiful together…</p>
              <Button size="lg" className="crayon-effect bg-primary/80 hover:bg-primary text-primary-foreground text-lg px-8 py-6 rounded-2xl" onClick={() => scrollToRef(sectionRefs.formIntro)}>
                Begin the Journey <Heart className="ml-2 fill-white" />
              </Button>
            </SectionWrapper>
          </div>

          <div ref={sectionRefs.formIntro}>
            <SectionWrapper>
                <h2 className="text-4xl md:text-5xl font-headline text-shadow mb-6">✨ Before I say something important... ✨</h2>
                <motion.p 
                    className="text-xl md:text-2xl font-quote text-muted-foreground mb-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 1.5 }}
                >
                    “There’s something I’ve been wanting to tell you for a long time. But before that... let’s go back for a moment.” 💫
                </motion.p>
                <Button 
                    size="lg" 
                    className="crayon-effect bg-primary/80 hover:bg-primary text-primary-foreground text-lg px-8 py-6 rounded-2xl heartbeat"
                    onClick={() => scrollToRef(sectionRefs.form)}
                >
                    Continue
                </Button>
            </SectionWrapper>
          </div>

          <div ref={sectionRefs.form}>
            <SectionWrapper className="justify-start pt-24">
                <Form {...form}>
                    <form className="space-y-12 text-left w-full">
                        <AnimatedFormItem delay={0.2}>
                            <FormField
                                control={form.control}
                                name="favoriteMemory"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xl font-quote text-foreground/80">
                                          <div className="flex items-start gap-3">
                                            <span>💭</span>
                                            <span>“What’s the first memory of us that always makes you smile?”</span>
                                          </div>
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea
                                                {...field}
                                                placeholder="Type here..."
                                                className="crayon-effect mt-2 bg-white/50 h-24 text-lg"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </AnimatedFormItem>
                        
                        <AnimatedFormItem delay={0.4}>
                            <FormField
                                control={form.control}
                                name="personality"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xl font-quote text-foreground/80">
                                          <div className="flex items-start gap-3">
                                            <span>🌸</span>
                                            <span>“If you had to describe ‘us’ in one word, what would it be?”</span>
                                          </div>
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="Type here..."
                                                className="crayon-effect mt-2 text-lg h-12 bg-white/50"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </AnimatedFormItem>

                        <AnimatedFormItem delay={0.6}>
                            <FormField
                                control={form.control}
                                name="favoriteThing"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xl font-quote text-foreground/80">
                                          <div className="flex items-start gap-3">
                                            <span>🎁</span>
                                            <span>“What’s the little thing about me that always makes you smile?”</span>
                                          </div>
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea
                                                {...field}
                                                placeholder="Type here..."
                                                className="crayon-effect mt-2 bg-white/50 h-24 text-lg"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </AnimatedFormItem>
                        
                        <AnimatedFormItem delay={0.8}>
                            <FormField
                                control={form.control}
                                name="emotion"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-xl font-quote text-foreground/80">
                                          <div className="flex items-start gap-3">
                                            <span>💓</span>
                                            <span>“When you think of me, what do you feel?”</span>
                                          </div>
                                        </FormLabel>
                                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-wrap justify-center gap-4 pt-4">
                                        {emotionEmojis.map(({emoji, label}) => (
                                            <FormItem key={emoji}>
                                            <FormControl>
                                                <RadioGroupItem value={emoji} className="sr-only" />
                                            </FormControl>
                                            <FormLabel>
                                                <motion.div
                                                whileHover={{ scale: 1.2, rotate: 5 }}
                                                whileTap={{ scale: 0.9 }}
                                                className={`text-4xl cursor-pointer transition-all duration-200 ${field.value === emoji ? 'scale-125 opacity-100' : 'opacity-60'}`}
                                                aria-label={label}
                                                title={label}
                                                >
                                                {emoji}
                                                </motion.div>
                                            </FormLabel>
                                            </FormItem>
                                        ))}
                                        </RadioGroup>
                                    </FormItem>
                                )}
                            />
                        </AnimatedFormItem>

                        <AnimatedFormItem delay={1.0}>
                            <FormField
                                control={form.control}
                                name="tone"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xl font-quote text-foreground/80">
                                      <div className="flex items-start gap-3">
                                        <span>✍️</span>
                                        <span>“And how should this message sound?”</span>
                                      </div>
                                    </FormLabel>
                                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex justify-center gap-4 pt-4">
                                    {toneOptions.map(option => (
                                        <FormItem key={option.value}>
                                            <FormControl>
                                            <RadioGroupItem value={option.value} className="sr-only" />
                                            </FormControl>
                                            <FormLabel>
                                            <div className={`crayon-effect wiggle cursor-pointer px-6 py-3 border-2 rounded-xl flex items-center gap-2 transition-all ${field.value === option.value ? 'bg-accent/50 border-accent-foreground' : 'bg-white/30'}`}>
                                                <option.icon className="w-5 h-5" />
                                                <span className="text-lg whitespace-nowrap">{option.label}</span>
                                            </div>
                                            </FormLabel>
                                        </FormItem>
                                    ))}
                                    </RadioGroup>
                                </FormItem>
                                )}
                            />
                        </AnimatedFormItem>
                        
                        <AnimatedFormItem delay={1.2}>
                            <div className="pt-8 text-center">
                                 <Button type="button" size="lg" className="crayon-effect bg-primary/80 hover:bg-primary text-primary-foreground text-lg px-8 py-6 rounded-2xl" onClick={handleGenerateMessage} disabled={isLoading}>
                                    {isLoading ? <Wind className="animate-spin mr-2" /> : <Sparkles className="mr-2" />}
                                    {isLoading ? 'Creating Magic...' : 'I’m ready to hear what’s in your heart… 💌'}
                                </Button>
                            </div>
                        </AnimatedFormItem>
                    </form>
                </Form>
            </SectionWrapper>
          </div>
          
          {showObservations && (
            <div ref={sectionRefs.observations}>
                <SectionWrapper>
                  <Card className="glassmorphism-card crayon-effect w-full p-6 md:p-8">
                    <CardContent className="p-0">
                      <h2 className="text-3xl font-headline mb-6 text-shadow">You know… I’ve been thinking about what you said.</h2>
                      <div className="space-y-4 text-left font-quote text-2xl">
                          <ObservationItem text={<>You remembered ‘{form.getValues('favoriteMemory')}’ — and somehow, that memory felt warmer just because it had you in it.</>} delay={0.5} />
                          <ObservationItem text={<>You described me as ‘{form.getValues('personality')}’ — maybe because there’s something so effortlessly real about the way we are together.</>} delay={1.5} />
                          <ObservationItem text={<>And your favorite little thing, ‘{form.getValues('favoriteThing')}’ — that one made me smile more than you’d guess.</>} delay={2.5} />
                          <ObservationItem text={<>It’s funny, isn’t it? How every tiny thing about you turns ordinary moments into something I never want to forget. 💌</>} delay={3.5} />
                          <ObservationItem text={<>I don’t know when it happened… but somewhere between those small memories and late-night thoughts, you became something I can’t stop caring about.</>} delay={4.5} />
                          <motion.p
                            className="text-center pt-6 font-body text-base text-muted-foreground"
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            transition={{ delay: 6.0, duration: 1.5 }}
                          >
                            “So maybe this isn’t just about what we remember — it’s about what we’re becoming.” 🌙
                          </motion.p>
                      </div>
                    </CardContent>
                  </Card>
                </SectionWrapper>
            </div>
          )}

          {generatedMessage && (
            <div ref={sectionRefs.reveal}>
              <SectionWrapper>
                <Card className="glassmorphism-card crayon-effect w-full p-6 md:p-8">
                  <CardContent className="p-0">
                    <p className="font-quote text-2xl md:text-3xl leading-relaxed mb-8">
                      “<Typewriter text={generatedMessage} />”
                    </p>
                    <Button variant="link" className="mt-8 text-foreground" onClick={() => scrollToRef(sectionRefs.proposal)}>
                      And one more thing...
                    </Button>
                  </CardContent>
                </Card>
              </SectionWrapper>
            </div>
          )}

          {generatedMessage && (
            <div ref={sectionRefs.proposal}>
              <SectionWrapper>
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="w-full p-8 rounded-2xl relative"
                  ref={proposalContainerRef}
                >
                  <h2 className="text-4xl md:text-5xl font-headline text-shadow mb-8">
                    So… will you be my girlfriend? 💍
                  </h2>
                  <div className="flex justify-center items-center gap-8 relative h-48">
                      <Button size="lg" className="text-2xl px-12 py-8 rounded-2xl crayon-effect bg-primary/80 hover:bg-primary text-primary-foreground heartbeat" onClick={() => handleProposalResponse('yes')}>
                        Yes 💕
                      </Button>
                      <Button 
                        ref={noButtonRef}
                        size="lg" 
                        className="text-2xl px-12 py-8 rounded-2xl crayon-effect bg-accent/80 hover:bg-accent text-accent-foreground absolute" 
                        onMouseEnter={handleNoInteraction}
                        onTouchStart={handleNoInteraction}
                        onClick={() => !isDodging && handleProposalResponse('no')}
                        style={isDodging ? { top: noPosition.y, left: noPosition.x, transition: 'top 0.3s, left 0.3s' } : {}}
                      >
                        No 🙃
                      </Button>
                  </div>
                </motion.div>
              </SectionWrapper>
            </div>
          )}
        </motion.main>
      )}

      {proposalStatus === 'yes' && (
        <motion.div key="yes" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="min-h-screen flex items-center justify-center text-center">
          <Confetti />
          <Card className="glassmorphism-card crayon-effect p-8">
            <CardContent className="p-0">
              <h2 className="font-quote text-3xl mb-4">You just made my world brighter. Here’s to forever — one smile at a time.</h2>
              <p className="text-muted-foreground mt-8">Some moments aren’t meant to be explained — just felt.</p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {proposalStatus === 'no' && (
        <motion.div key="no" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} className="min-h-screen flex items-center justify-center text-center bg-gray-900/50">
          <Card className="glassmorphism-card crayon-effect p-8 max-w-md">
            <CardContent className="p-0 space-y-4">
              <p className="text-lg">Okay okay… got it 😅</p>
              <p>You don’t like me — I know. Maybe I wasn’t the one for you. But whenever you hear my name again, I hope you’ll whisper,</p>
              <p className="font-bold text-xl">‘Damn… he was different.’ 🥹💔</p>
              <p className="font-quote text-2xl pt-6"><Typewriter text="Not all stories end in forever — some just leave warmth behind." /></p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
