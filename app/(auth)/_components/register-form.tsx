"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useState, useTransition } from 'react';

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { register, type RegisterActionState } from '../actions';
import { registerFormSchema, type RegisterFormValues } from '@/lib/schemas/auth';

export function RegisterForm() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        setMounted(true);
    }, []);

    const [state, formAction] = useActionState<RegisterActionState, FormData>(
        register,
        {
            status: 'idle',
        },
    );

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerFormSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    useEffect(() => {
        if (state.status === 'user_exists') {
            toast.error('Account already exists!');
        } else if (state.status === 'failed') {
            toast.error('Failed to create account!');
        } else if (state.status === 'invalid_data') {
            toast.error('Failed validating your submission!');
        } else if (state.status === 'success') {
            toast.success('Account created successfully!');
            router.push('/');
        }
    }, [state.status, router]);

    const onSubmit = async (data: RegisterFormValues) => {
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
                                    autoComplete="new-password"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button className="w-full" type="submit" disabled={state.status === 'in_progress' || isPending}>
                    {state.status === 'in_progress' || isPending ? 'Creating account...' : 'Sign Up'}
                </Button>
            </form>
        </Form>
    );
}
