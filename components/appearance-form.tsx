'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useThemeStore } from '@/lib/stores';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/components/toast';
import { appearanceFormSchema, type AppearanceFormValues } from '@/lib/schemas/settings';

export function AppearanceForm() {
    const { theme, setTheme } = useThemeStore();

    const form = useForm<AppearanceFormValues>({
        resolver: zodResolver(appearanceFormSchema),
        defaultValues: {
            theme: theme || 'system',
        },
    });

    function onSubmit(data: AppearanceFormValues) {
        setTheme(data.theme);
        toast({
            type: 'success',
            description: 'Theme updated successfully!',
        });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                    control={form.control}
                    name="theme"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Theme</FormLabel>
                            <FormDescription>
                                Select the theme for the application.
                            </FormDescription>
                            <FormMessage />
                            <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="grid max-w-md grid-cols-3 gap-8 pt-2"
                            >
                                <FormItem>
                                    <FormLabel className="[&:has([data-state=checked])>div]:border-primary">
                                        <FormControl>
                                            <RadioGroupItem value="light" className="sr-only" />
                                        </FormControl>
                                        <div className="border-muted hover:border-accent items-center rounded-md border-2 p-1">
                                            <div className="space-y-2 rounded-sm bg-[#ecedef] p-2">
                                                <div className="space-y-2 rounded-md bg-white p-2 shadow-sm">
                                                    <div className="h-2 w-[80px] rounded-lg bg-[#ecedef]" />
                                                    <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                                                </div>
                                                <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                                                    <div className="size-4 rounded-full bg-[#ecedef]" />
                                                    <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                                                </div>
                                                <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                                                    <div className="size-4 rounded-full bg-[#ecedef]" />
                                                    <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                                                </div>
                                            </div>
                                        </div>
                                        <span className="block w-full p-2 text-center font-normal">
                                            Light
                                        </span>
                                    </FormLabel>
                                </FormItem>
                                <FormItem>
                                    <FormLabel className="[&:has([data-state=checked])>div]:border-primary">
                                        <FormControl>
                                            <RadioGroupItem value="dark" className="sr-only" />
                                        </FormControl>
                                        <div className="border-muted bg-popover hover:bg-accent hover:text-accent-foreground items-center rounded-md border-2 p-1">
                                            <div className="space-y-2 rounded-sm bg-slate-950 p-2">
                                                <div className="space-y-2 rounded-md bg-slate-800 p-2 shadow-sm">
                                                    <div className="h-2 w-[80px] rounded-lg bg-slate-400" />
                                                    <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                                                </div>
                                                <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                                                    <div className="size-4 rounded-full bg-slate-400" />
                                                    <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                                                </div>
                                                <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                                                    <div className="size-4 rounded-full bg-slate-400" />
                                                    <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                                                </div>
                                            </div>
                                        </div>
                                        <span className="block w-full p-2 text-center font-normal">
                                            Dark
                                        </span>
                                    </FormLabel>
                                </FormItem>
                                <FormItem>
                                    <FormLabel className="[&:has([data-state=checked])>div]:border-primary">
                                        <FormControl>
                                            <RadioGroupItem value="system" className="sr-only" />
                                        </FormControl>
                                        <div className="border-muted hover:border-accent items-center rounded-md border-2 p-1">
                                            <div className="space-y-2 rounded-sm bg-gradient-to-r from-[#ecedef] to-slate-950 p-2">
                                                <div className="space-y-2 rounded-md bg-gradient-to-r from-white to-slate-800 p-2 shadow-sm">
                                                    <div className="h-2 w-[80px] rounded-lg bg-gradient-to-r from-[#ecedef] to-slate-400" />
                                                    <div className="h-2 w-[100px] rounded-lg bg-gradient-to-r from-[#ecedef] to-slate-400" />
                                                </div>
                                                <div className="flex items-center space-x-2 rounded-md bg-gradient-to-r from-white to-slate-800 p-2 shadow-sm">
                                                    <div className="size-4 rounded-full bg-gradient-to-r from-[#ecedef] to-slate-400" />
                                                    <div className="h-2 w-[100px] rounded-lg bg-gradient-to-r from-[#ecedef] to-slate-400" />
                                                </div>
                                            </div>
                                        </div>
                                        <span className="block w-full p-2 text-center font-normal">
                                            System
                                        </span>
                                    </FormLabel>
                                </FormItem>
                            </RadioGroup>
                        </FormItem>
                    )}
                />

                <Button type="submit">Update preferences</Button>
            </form>
        </Form>
    );
}
