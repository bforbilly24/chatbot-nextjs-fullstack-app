"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useState, useTransition } from 'react';

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { login, type LoginActionState } from '../actions';
import { loginFormSchema, type LoginFormValues } from '@/lib/schemas/auth';

export function LoginForm() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [isRedirecting, setIsRedirecting] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const [state, formAction] = useActionState<LoginActionState, FormData>(
        login,
        {
            status: 'idle',
        },
    );

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginFormSchema),
        defaultValues: {
            email: "",
            password: "",
            remember: false,
        },
    });

    useEffect(() => {
        if (state.status === 'failed') {
            toast.error('Invalid credentials!');
        } else if (state.status === 'invalid_data') {
            toast.error('Failed validating your submission!');
        } else if (state.status === 'success' && !isRedirecting) {
            setIsRedirecting(true);
            toast.success('Login successful!');
            setTimeout(() => {
                router.push('/');
            }, 100);
        }
    }, [state.status, router, isRedirecting]);

    const onSubmit = async (data: LoginFormValues) => {
        const formData = new FormData();
        formData.append('email', data.email);
        formData.append('password', data.password);
        
        startTransition(() => {
            formAction(formData);
        });
    };

    if (!mounted) {
        return null;
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                                <Input id="email" type="email" placeholder="you@example.com" autoComplete="email" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="remember"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center">
                            <FormControl>
                                <Checkbox
                                    id="login-remember"
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    className="size-4"
                                />
                            </FormControl>
                            <FormLabel htmlFor="login-remember" className="text-muted-foreground ml-1 text-sm font-medium">
                                Remember me for 30 days
                            </FormLabel>
                        </FormItem>
                    )}
                />
                <Button className="w-full" type="submit" disabled={state.status === 'in_progress' || isPending}>
                    {state.status === 'in_progress' || isPending ? 'Logging in...' : 'Login'}
                </Button>
            </form>
        </Form>
    );
}
