'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Link, useNavigate } from 'react-router-dom'
import agent from '@/app/api/agent'
import { AxiosError } from 'axios'
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// validations match one's on BE
const formSchema = z.object({
    firstName: z.string().min(1, { message: 'First name must be at least 1 character' }).max(64, { message: 'First name must be max 64 characters' }),
    lastName: z.string().min(1, { message: 'Last name must be at least 1 character' }).max(64, { message: 'Last name must be max 64 characters' }),
    email: z.string().email({ message: 'Invalid email address' }),
    password: z.string()
        .min(6, { message: 'Password must be at least 6 characters' })
        .max(128, { message: 'Password must be max 128 characters'})
        .regex(new RegExp("[a-z]"), {
            message: "Must contain at least one lowercase letter",
        })
        .regex(new RegExp("[A-Z]"), {
            message: "Must contain at least one uppercase letter",
        })
        .regex(new RegExp("[0-9]"), {
            message: "Must contain at least one number",
        }),
    passwordConfirmation: z.string(),
}).refine((data) => data.password === data.passwordConfirmation, {
    message: "Passwords don't match",
    path: ["passwordConfirmation"],
});


export default function Register() {
    const navigate = useNavigate()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            passwordConfirmation: '',
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            await agent.Account.register({
                firstName: values.firstName,
                lastName: values.lastName,
                email: values.email,
                password: values.password,
                passwordAgain: values.passwordConfirmation
            });

            toast.success("Registration successful.");
            setTimeout(() => {
                navigate('/login');
            }, 2500);
        } catch (error) {
            if (error instanceof AxiosError) {
                const responseData = error.response?.data || {};
                let messages = "";

                // valdation error - should not happen because of same setting of validator as in BE
                if (responseData.status === 400 &&
                    responseData.errors) {
                    const validationErrors = responseData.errors;
                    Object.keys(validationErrors).forEach((field) => {
                        const message = validationErrors[field][0];
                        messages = messages + "/n" + message;
                    });
                    console.error('Register error from BE validations:', error);
                    form.setError('root', {
                        type: 'manual',
                        message: `${messages}`,
                    });
                // custom error on BE by StatusCodeGuard
                } else if (responseData.ErrorMessage) {
                    console.error('Register error:', error);
                    form.setError('root', {
                        type: 'manual',
                        message: `${responseData.ErrorMessage}`,
                    });
                } else {
                    console.error("Unknown register error:", error);
                    form.setError('root', {
                        type: 'manual',
                        message: 'An error occurred. Please try again.',
                    });
                }
            // TODO: make prettier so the code is not duplicated
            } else {
                console.error("Unknown register error:", error);
                form.setError('root', {
                    type: 'manual',
                    message: 'An error occurred. Please try again.',
                });
            }
        }
    }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Card className="w-[400px]">
            <CardHeader>
                <CardTitle>Registrácia</CardTitle>
                <CardDescription>Vytvorte si nový účet pre používanie aplikácie</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="flex space-x-4">
                            <FormField
                                control={form.control}
                                name="firstName"
                                render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormLabel>Meno</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Peter" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="lastName"
                                render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormLabel>Priezvisko</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Toth" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder="peter.toth@example.com" {...field} />
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
                                <FormLabel>Heslo</FormLabel>
                                <FormControl>
                                    <Input type="password" placeholder="Vložte svoje heslo" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                        )}
                        />
                        <FormField
                            control={form.control}
                            name="passwordConfirmation"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Heslo znovu</FormLabel>
                                <FormControl>
                                    <Input type="password" placeholder="Zadajte znovu svoje heslo" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        {form.formState.errors.root && (
                        <div className="text-red-500 text-sm mt-2">
                            {form.formState.errors.root.message}
                        </div>
                        )}
                        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? (
                                <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Prosím počkajte...
                                </>
                            ) : (
                                'Vytvoriť účet'
                            )}
                        </Button>
                    </form>
                </Form>
                <div className="mt-4 text-center">
                    <Link to="/login">
                        <Button variant="outline" className="w-full">
                            Prihlásiť sa do existujúceho účtu
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
        <ToastContainer position="bottom-right" autoClose={1500} hideProgressBar={true} closeOnClick pauseOnHover/>
    </div>
  )
}