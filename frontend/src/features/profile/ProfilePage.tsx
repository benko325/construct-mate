import { useForm } from "react-hook-form";
import TopBar from "../TopBar";
import { useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import agent from "@/app/api/agent";


const formSchema = z.object({
    firstName: z.string().min(1, { message: 'Meno je povinné' }).max(64, { message: 'Meno musí mať menej ako 64 znakov' }),
    lastName: z.string().min(1, { message: 'Priezvisko je povinné' }).max(64, { message: 'Priezvisko musí mať menej ako 64 znakov' }),
    email: z.string().email({ message: 'Nevalidný formát emailovej adresy' }),
});

type ProfileFormData = z.infer<typeof formSchema>;

export default function ProfilePage() {
    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ProfileFormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
        },
    });
    
    // Fetch user data and populate the form with it
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
    
    // Handle form submission
    const onSubmit = async (data: ProfileFormData) => {
        try {
            //await axios.patch('/api/user', data); // Adjust the endpoint as necessary
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Failed to update profile', error);
            alert('Failed to update profile.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <TopBar />
            <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-md mt-6">
                <h2 className="text-xl font-semibold mb-4">Aktualizovať profil</h2>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="mb-4">
                        <Label htmlFor="firstName">Meno</Label>
                        <Input
                            id="firstName"
                            placeholder="Meno"
                            {...register('firstName')}
                        />
                        {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName.message}</p>}
                    </div>

                    <div className="mb-4">
                        <Label htmlFor="lastName">Priezvisko</Label>
                        <Input
                            id="lastName"
                            placeholder="Priezvisko"
                            {...register('lastName')}
                        />
                        {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName.message}</p>}
                    </div>

                    <div className="mb-4">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="Email"
                            {...register('email')}
                        />
                        {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                    </div>

                    <Button type="submit" variant="default" disabled={isSubmitting}>
                        {isSubmitting ? 'Aktualizujem...' : 'Aktualizovať profil'}
                    </Button>
                </form>
            </div>
        </div>
    )
}