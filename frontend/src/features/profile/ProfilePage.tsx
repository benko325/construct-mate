import { useForm } from "react-hook-form";
import TopBar from "../TopBar";
import { useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import agent from "@/app/api/agent";
import { toast, ToastContainer } from "react-toastify";
import { AxiosError } from "axios";


const formSchema = z.object({
    firstName: z.string().min(1, { message: 'Meno je povinné' }).max(64, { message: 'Meno musí mať menej ako 64 znakov' }),
    lastName: z.string().min(1, { message: 'Priezvisko je povinné' }).max(64, { message: 'Priezvisko musí mať menej ako 64 znakov' }),
    email: z.string().email({ message: 'Nevalidný formát emailovej adresy' }),
});

type ProfileFormData = z.infer<typeof formSchema>;

export default function ProfilePage() {
    const { register, handleSubmit, reset, formState: { errors, isSubmitting }, setError } = useForm<ProfileFormData>({
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
                reset({ firstName, lastName, email }); // Set the initial values for the form
            } catch (error) {
                console.error('Failed to fetch user data', error);
            }
        };
    
        fetchUserData();
    }, [reset]);
    
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
                    setError('root', {
                        type: 'manual',
                        message: `${messages}`,
                    });
                // custom error on BE by StatusCodeGuard
                } else if (responseData.ErrorMessage) {
                    console.error('Register error:', error);
                    setError('root', {
                        type: 'manual',
                        message: `${responseData.ErrorMessage}`,
                    });
                } else {
                    // Handle any other unexpected error structure
                    console.error("Unknown register error:", error);
                    setError('root', {
                        type: 'manual',
                        message: 'An error occurred. Please try again.',
                    });
                }
            // Handle any other unexpected error structure
            // TODO: make prettier so the code is not duplicated
            } else {
                console.error("Unknown register error:", error);
                setError('root', {
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
            <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-md mt-6">
                <h2 className="text-xl font-semibold mb-4">Aktualizovať profil</h2>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="mb-4">
                        <Label htmlFor="firstName">Nové Meno</Label>
                        <Input
                            id="firstName"
                            placeholder="Meno"
                            {...register('firstName')}
                        />
                        {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName.message}</p>}
                    </div>

                    <div className="mb-4">
                        <Label htmlFor="lastName">Nové Priezvisko</Label>
                        <Input
                            id="lastName"
                            placeholder="Priezvisko"
                            {...register('lastName')}
                        />
                        {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName.message}</p>}
                    </div>

                    <div className="mb-4">
                        <Label htmlFor="email">Nový Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="Email"
                            {...register('email')}
                        />
                        {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                    </div>

                    {errors.root && (
                        <div className="text-red-500 text-sm m-2">
                            {errors.root.message}
                        </div>
                    )}

                    <Button type="submit" variant="default" disabled={isSubmitting}>
                        {isSubmitting ? 'Aktualizujem...' : 'Aktualizovať profil'}
                    </Button>
                </form>
            </div>
            <ToastContainer position="bottom-right" autoClose={1500} hideProgressBar={true} closeOnClick pauseOnHover/>
        </div>
    )
}