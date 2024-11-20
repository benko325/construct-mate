import { useForm } from "react-hook-form";
import TopBar from "../TopBar";
import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
  } from '@/components/ui/form'
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import agent from "@/app/api/agent";
import { toast, ToastContainer } from "react-toastify";
import { AxiosError } from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";


const formSchema = z.object({
    firstName: z.string().min(1, { message: 'Meno je povinné' }).max(64, { message: 'Meno musí mať menej ako 64 znakov' }),
    lastName: z.string().min(1, { message: 'Priezvisko je povinné' }).max(64, { message: 'Priezvisko musí mať menej ako 64 znakov' }),
    email: z.string().email({ message: 'Nevalidný formát emailovej adresy' }),
});

type ProfileFormData = z.infer<typeof formSchema>;

export default function ProfilePage() {
    const nameEmailForm = useForm<ProfileFormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
        },
    });
    
    // get user data and populate the form with it
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const { firstName, lastName, email } = await agent.Account.getNameAndEmail();
                nameEmailForm.reset({ firstName, lastName, email }); // Set the initial values for the form
            } catch (error) {
                console.error('Failed to fetch user data', error);
            }
        };
    
        fetchUserData();
    }, [nameEmailForm.reset]);
    
    const onSubmit = async (data: ProfileFormData) => {
        try {
            await agent.Account.setNameAndEmail({newFirstName: data.firstName, newLastName: data.lastName, newEmail: data.email});
            toast.success("Údaje boli aktualizované.");
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
                    nameEmailForm.setError('root', {
                        type: 'manual',
                        message: `${messages}`,
                    });
                // custom error on BE by StatusCodeGuard
                } else if (responseData.ErrorMessage) {
                    console.error('Register error:', error);
                    nameEmailForm.setError('root', {
                        type: 'manual',
                        message: `${responseData.ErrorMessage}`,
                    });
                } else {
                    console.error("Unknown register error:", error);
                    nameEmailForm.setError('root', {
                        type: 'manual',
                        message: 'An error occurred. Please try again.',
                    });
                }
            // TODO: make prettier so the code is not duplicated
            } else {
                console.error("Unknown register error:", error);
                nameEmailForm.setError('root', {
                    type: 'manual',
                    message: 'An error occurred. Please try again.',
                });
            }
            console.error('Failed to update profile', error);
            toast.error('Údaje sa nepodarilo aktualizovať.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <TopBar />
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <Card className="w-[400px]">
                    <CardHeader>
                        <CardTitle>Aktualizovať profil</CardTitle>
                        <CardDescription>Aktualizujte si meno, prizvisko a email</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...nameEmailForm}>
                            <form onSubmit={nameEmailForm.handleSubmit(onSubmit)} className="space-y-6">
                                <div className="flex space-x-4">
                                    <FormField
                                        control={nameEmailForm.control}
                                        name="firstName"
                                        render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel>Meno</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={nameEmailForm.control}
                                        name="lastName"
                                        render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel>Priezvisko</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                        )}
                                    />
                                </div>
                                <FormField
                                    control={nameEmailForm.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input type="email" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {nameEmailForm.formState.errors.root && (
                                <div className="text-red-500 text-sm mt-2">
                                    {nameEmailForm.formState.errors.root.message}
                                </div>
                                )}
                                <Button type="submit" className="w-full" disabled={nameEmailForm.formState.isSubmitting}>
                                    {nameEmailForm.formState.isSubmitting ? (
                                        <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Prosím počkajte...
                                        </>
                                    ) : (
                                        'Aktualizovať údaje'
                                    )}
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
            <ToastContainer position="bottom-right" autoClose={1500} hideProgressBar={true} closeOnClick pauseOnHover/>
        </div>
    )
}