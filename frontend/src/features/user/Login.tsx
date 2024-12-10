import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import agent from "@/app/api/agent";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { AxiosError } from "axios";
import { useUser } from '../../context/UserContext.tsx';

const formSchema = z.object({
    email: z.string().email({ message: 'Neplatný tvar emailovej adresy' }),
    password: z.string()
        .min(6, { message: 'Heslo musí mať aspoň 6 znakov' })
        .max(128, { message: 'Heslo musí mať maximálne 128 znakov' })
        .regex(new RegExp("[a-z]"), {
            message: "Heslo musí obsahovať aspoň 1 malé písmeno",
        })
        .regex(new RegExp("[A-Z]"), {
            message: "Heslo musí obsahovať aspoň 1 veľké písmeno",
        })
        .regex(new RegExp("[0-9]"), {
            message: "Heslo musí obsahovať aspoň 1 číslo",
        }),
});

export default function Login() {
    const { fetchUser } = useUser();
    const navigate = useNavigate();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
        email: '',
        password: '',
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            await agent.Account.logout();
        } catch (error) {
            // no need to do nothing, logout is there just until protected routes are behaving correctly
        }

        try {
            await agent.Account.login({email: values.email, password: values.password});
            await fetchUser();
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
                    message: 'Nastala chyba. Prosím skúste znova.',
                });
            }
        }
    };
    
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
                            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting ? (
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
};