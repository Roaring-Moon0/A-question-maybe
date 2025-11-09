
'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { generateRomanticMessage, type RomanticMessageInput } from '@/ai/flows/generate-romantic-message';
import { saveProposalResponse } from '@/app/actions';
import { useToast } from '@/components/ui/use-toast';
import { Heart, Smile, Wand2, Feather, Sparkles, Film, Brush, Gift, MessageCircleQuestion } from 'lucide-react';
import { cn } from "@/lib/utils";

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ScrollArea } from '@/components/ui/scroll-area';

import { FloatingHearts } from '@/components/heartfelt-unveiling/floating-hearts';
import { Typewriter } from '@/components/heartfelt-unveiling/typewriter';
import { Confetti } from '@/components/heartfelt-unveiling/confetti';
import { Loader } from '@/components/heartfelt-unveiling/loader';


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
  const [appState, setAppState] = useState('loading'); // loading, intro, form
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showObservations, setShowObservations] = useState(false);
  const [proposalStatus, setProposalStatus] = useState<ProposalStatus>('pending');
  const [noCount, setNoCount] = useState(0);
  const [noPosition, setNoPosition] = useState<{ x: number | 'auto', y: number | 'auto' }>({ x: 'auto', y: 'auto' });
  const [isDodging, setIsDodging] = useState(false);
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

   useEffect(() => {
    const timer = setTimeout(() => {
      setAppState('intro');
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

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
    if (!proposalContainerRef.current || !noButtonRef.current) return;
    
    if (!isDodging) {
      setIsDodging(true);
    }

    setNoCount(c => c + 1);
    if (noCount >= 9) {
      setIsDodging(false); // Stop dodging
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
    { ' emoji': '☀️', label: 'Radiant' }
  ], []);

  const toneOptions = useMemo(() => [
    { value: 'Poetic', icon: Feather, label: 'Poetic' },
    { value: 'Flirty', icon: Wand2, label: 'Flirty' },
    { value: 'Silly', icon: Smile, label: 'Silly' }
  ], []);
  
  const formFields = [
    { name: 'favoriteMemory', icon: Film, question: '“What’s the first memory of us that always makes you smile?”' },
    { name: 'personality', icon: Brush, question: '“If you had to describe ‘us’ in one word, what would it be?”' },
    { name: 'favoriteThing', icon: Gift, question: '“What’s the little thing about me that always makes you smile?”' }
  ];


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
  
  const YesResponseItem = ({ text, delay }: { text: React.ReactNode, delay: number }) => (
    <motion.p
      className="text-xl md:text-2xl font-quote text-shadow mb-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 1.5 }}
    >
      {text}
    </motion.p>
  );

  if (appState === 'loading') {
    return <Loader />;
  }

  return (
    <AnimatePresence>
      {proposalStatus === 'pending' && (
        <motion.main key="form" exit={{ opacity: 0 }} className="w-full">
          
          <div ref={sectionRefs.intro}>
             <SectionWrapper className="intro-gradient">
               <FloatingHearts />
                <motion.h1 
                    className="text-5xl md:text-7xl font-bold text-shadow mb-4 font-headline"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.5 }}
                >
                    A Message from the Heart
                </motion.h1>
                <motion.p 
                    className="text-lg md:text-xl text-muted-foreground mb-8 max-w-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 1 }}
                >
                    Before you read a single word, take a breath… this is something made only for you. 🌷
                </motion.p>
                 <motion.p 
                    className="text-md md:text-lg text-muted-foreground/80 mb-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.5, delay: 2.5 }}
                >
                    Because sometimes, words aren’t enough — but they’re where love begins. 💫
                </motion.p>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 1.5 }}
                >
                  <Button 
                      size="lg" 
                      className="crayon-effect bg-primary/80 hover:bg-primary text-primary-foreground text-lg px-8 py-6 rounded-2xl journey-button" 
                      onClick={() => {
                        setAppState('form');
                        setTimeout(() => scrollToRef(sectionRefs.formIntro), 100);
                      }}
                  >
                      Begin the Journey <Heart className="ml-2 fill-white w-5 h-5 transition-transform" />
                  </Button>
                </motion.div>

                <motion.p 
                    className="absolute bottom-4 right-4 text-xs text-muted-foreground/50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 2, delay: 3.5 }}
                >
                    Everything you’re about to see… was written for you.
                </motion.p>
            </SectionWrapper>
          </div>
          
          <AnimatePresence>
            {appState === 'form' &&
              <motion.div 
                key="form-section"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5 }}
                className="w-full max-w-2xl mx-auto"
              >

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
                            {formFields.map((item, index) => (
                                <AnimatedFormItem key={item.name} delay={index * 0.2 + 0.2}>
                                    <FormField
                                        control={form.control}
                                        name={item.name as any}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xl font-quote text-foreground/80 flex items-start gap-3">
                                                    <item.icon className="w-6 h-6 mt-1 text-primary/80 shrink-0" />
                                                    <span>{item.question}</span>
                                                </FormLabel>
                                                <FormControl>
                                                    {item.name === 'favoriteMemory' ? (
                                                      <Textarea
                                                          {...field}
                                                          placeholder="Type here..."
                                                          className="crayon-effect mt-2 bg-white/50 h-24 text-lg"
                                                      />
                                                    ) : (
                                                      <Input
                                                          {...field}
                                                          placeholder="Type here..."
                                                          className="crayon-effect mt-2 text-lg h-12 bg-white/50"
                                                      />
                                                    )}
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </AnimatedFormItem>
                            ))}
                            
                            <AnimatedFormItem delay={0.8}>
                                <FormField
                                    control={form.control}
                                    name="emotion"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xl font-quote text-foreground/80 flex items-start gap-3">
                                                <Heart className="w-6 h-6 mt-1 text-primary/80 shrink-0" />
                                                <span>“When you think of me, what do you feel?”</span>
                                            </FormLabel>
                                            <ScrollArea className="w-full whitespace-nowrap">
                                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex justify-start gap-4 pt-4 px-4">
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
                                            </ScrollArea>
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
                                        <FormLabel className="text-xl font-quote text-foreground/80 flex items-start gap-3">
                                            <MessageCircleQuestion className="w-6 h-6 mt-1 text-primary/80 shrink-0" />
                                          <span>“And how should this message sound?”</span>
                                        </FormLabel>
                                        <ScrollArea className="w-full whitespace-nowrap">
                                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex justify-start gap-4 pt-4 px-4">
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
                                        </ScrollArea>
                                    </FormItem>
                                    )}
                                />
                            </AnimatedFormItem>
                            
                            <AnimatedFormItem delay={1.2}>
                                <div className="pt-8 text-center">
                                     <Button type="button" size="lg" className="crayon-effect bg-primary/80 hover:bg-primary text-primary-foreground text-lg px-8 py-6 rounded-2xl" onClick={handleGenerateMessage} disabled={isLoading}>
                                        {isLoading ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}><Sparkles/></motion.div> : <Sparkles />}
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
                              <ObservationItem text={<>You described us as ‘{form.getValues('personality')}’ — maybe because there’s something so effortlessly real about the way we are together.</>} delay={1.5} />
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
                           {generatedMessage && (
                              <div className="text-center mt-8">
                                  <Button variant="link" className="text-foreground" onClick={() => scrollToRef(sectionRefs.reveal)}>
                                      Continue...
                                  </Button>
                              </div>
                          )}
                        </CardContent>
                      </Card>
                    </SectionWrapper>
                </div>
              )}

              {generatedMessage && (
                <div ref={sectionRefs.reveal}>
                  <SectionWrapper className="min-h-0 py-8">
                    <Card className="glassmorphism-card crayon-effect w-full p-6 md:p-8">
                      <CardContent className="p-0">
                        <p className="font-quote text-2xl md:text-3xl leading-relaxed mb-8">
                          “<Typewriter text={generatedMessage} />”
                        </p>
                        <Button variant="link" className="mt-8 text-foreground" onClick={() => scrollToRef(sectionRefs.proposal)}>
                           And before I say the one thing I’ve been holding in…
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
                    >
                      <p className="text-xl md:text-2xl font-quote text-muted-foreground mb-4">So… this is it. The thing I’ve been meaning to ask you.</p>
                      <h2 className="text-4xl md:text-5xl font-headline text-shadow mb-4">
                        Will you be my girlfriend? 💍
                      </h2>
                       <p className="text-md text-muted-foreground mb-8">(Yeah… my heart’s been rehearsing this line forever.) 💓</p>
                      <div className="flex justify-center items-center gap-8 relative h-32 md:h-48" ref={proposalContainerRef}>
                          <Button size="lg" className="text-2xl px-12 py-8 rounded-full crayon-effect bg-primary/90 hover:bg-primary text-primary-foreground heartbeat shadow-lg hover:shadow-primary/50 transition-all" onClick={() => handleProposalResponse('yes')}>
                            Yes 💕
                          </Button>
                          <Button 
                            ref={noButtonRef}
                            size="lg" 
                            className={cn(
                              "text-2xl px-12 py-8 rounded-full crayon-effect bg-accent/90 hover:bg-accent text-accent-foreground shadow-md hover:shadow-accent/40 transition-all",
                              isDodging && "absolute"
                            )}
                            onMouseEnter={handleNoInteraction}
                            onTouchStart={handleNoInteraction}
                            onClick={() => {
                              if (!isDodging) {
                                handleProposalResponse('no')
                              }
                            }}
                            style={isDodging ? { top: noPosition.y, left: noPosition.x, transition: 'top 0.3s, left 0.3s' } : {}}
                          >
                            No 😔
                          </Button>
                      </div>
                    </motion.div>
                  </SectionWrapper>
                </div>
              )}
            </motion.div>
            }
          </AnimatePresence>
        </motion.main>
      )}

      {proposalStatus === 'yes' && (
        <motion.div key="yes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{duration: 1.5}} className="min-h-screen flex items-center justify-center text-center p-4">
          <Confetti />
          <FloatingHearts />
          <Card className="glassmorphism-card crayon-effect p-8 max-w-2xl">
            <CardContent className="p-0 space-y-3">
              <YesResponseItem text="You really said yes…? 🥹💗" delay={0.5} />
              <YesResponseItem text="Wait, I swear I’m not crying, you are. 😭" delay={1.5} />
              <YesResponseItem text="You just made my world stop for a second." delay={2.5} />
              <YesResponseItem text="I can’t even explain how much this means — but I’ll spend forever trying to show you. 💖" delay={3.5} />
              <YesResponseItem text="You didn’t just say yes to a question… you said yes to me." delay={5} />
              
              <motion.div initial={{opacity: 0}} animate={{opacity: 1}} transition={{delay: 6.5, duration: 1.5}} className="pt-8">
                <p className="text-lg font-quote text-muted-foreground">“And now that you’ve said it…” 💭</p>
                <p className="text-lg font-quote text-muted-foreground mb-6">You already have my number — just text me, or call me. ☎️💌</p>
                <p className="text-lg md:text-xl font-body mb-8">I’ll be waiting… with the biggest smile. 😊💓</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button className="crayon-effect" onMouseEnter={(e) => e.currentTarget.classList.add('wiggle')}>Okay… I’m calling you 😳💞</Button>
                    <Button variant="ghost" onClick={() => window.location.reload()}>Let’s make more memories 💫</Button>
                </div>
              </motion.div>

               <motion.p initial={{opacity: 0}} animate={{opacity: 1}} transition={{delay: 8, duration: 1.5}} className="text-center pt-10 font-quote text-sm text-muted-foreground/80">
                No matter how many pages this story gets… you’ll always be my favorite line. ✨
              </motion.p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {proposalStatus === 'no' && (
        <motion.div key="no" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} className="min-h-screen flex items-center justify-center text-center bg-gray-900/50 p-4">
          <Card className="glassmorphism-card crayon-effect p-8 max-w-md">
            <CardContent className="p-0 space-y-4">
              <p className="text-lg">Okay okay… got it 😅</p>
              <p>You don’t like me — I know. Maybe I wasn’t the one for you. But whenever you hear my name again, I hope you’ll whisper,</p>
              <p className="font-bold text-xl font-headline">‘Damn… he was different.’ 🥹💔</p>
              <p className="font-quote text-2xl pt-6"><Typewriter text="Not all stories end in forever — some just leave warmth behind." /></p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

    