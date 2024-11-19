import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Link, useNavigate } from "react-router-dom"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import agent from "@/app/api/agent"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Loader2 } from "lucide-react"
import { AxiosError } from "axios"
import { useAuth } from "../../context/AuthContext.tsx"

const formSchema = z.object({
    email: z.string().email({ message: 'Invalid email address' }),
    password: z.string()
        .min(6, { message: 'Password must be at least 6 characters' })
        .max(128, { message: 'Password must be max 128 characters' })
        .regex(new RegExp("[a-z]"), {
            message: "Password must contain at least one lowercase letter",
        })
        .regex(new RegExp("[A-Z]"), {
            message: "Password must contain at least one uppercase letter",
        })
        .regex(new RegExp("[0-9]"), {
            message: "Must contain at least one number",
        }),
});

export default function Login() {
    const { setIsAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
        email: '',
        password: '',
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        try {
            await agent.Account.logout();
        } catch (error) {
            // no need to do nothing, logoud is there just until protected routes are behaving correctly
        }

        try {
            await agent.Account.login({email: values.email, password: values.password});
            setIsAuthenticated(true);
            navigate('/dashboard');
        } catch (error) {
            if (error instanceof AxiosError) {
                console.error('Login (Axios) error:', error);
                form.setError('root', {
                    type: 'manual',
                    message: `${error.response?.data.ErrorMessage}`,
                });
            } else {
                form.setError('root', {
                    type: 'manual',
                    message: 'An error occurred. Please try again.',
                });
            }
        } finally {
            setIsLoading(false)
        }
    }
    
    return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Card className="mx-auto max-w-sm">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold">Login</CardTitle>
                <CardDescription>Zadajte email a heslo pre prihlásanie do účtu</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Zadajte email" {...field} />
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
                                        <Input type="password" placeholder="Zadajte heslo" {...field} />
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
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Prosím počkajte...
                                </>
                            ) : (
                                'Prihlásiť sa'
                            )}
                        </Button>
                    </form>
                </Form>
                <div className="mt-4 text-center">
                    <Link to="/register">
                        <Button variant="outline" className="w-full">
                            Vytvoriť nový účet
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    </div>
  )
}