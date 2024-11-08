import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const apiUrl = import.meta.env.VITE_API_URL;

const formSchema = z.object({
    email: z.string().email({ message: 'Invalid email address' }),
    password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
  })

export default function Login() {
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
          const response = await fetch('<URL>', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(values),
          })
    
          if (response.ok) {
            // Handle successful login
            console.log('Login successful')
            // Redirect or update UI as needed
          } else {
            // Handle error response
            const errorData = await response.json()
            console.error('Login failed:', errorData)
            form.setError('root', {
              type: 'manual',
              message: errorData.message || 'Login failed. Please try again.',
            })
          }
        } catch (error) {
          console.error('Login error:', error)
          form.setError('root', {
            type: 'manual',
            message: 'An error occurred. Please try again.',
          })
        } finally {
          setIsLoading(false)
        }
    }
    
    return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Card className="mx-auto max-w-sm">
            <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold">Login</CardTitle>
                <CardDescription>Enter your email and password to login to your account</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="m@example.com" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" required />
                    </div>
                    <Button type="submit" className="w-full">
                        Login
                    </Button>
                    <div className="mt-4 text-center">
                        <Link to="/register">
                            <Button variant="outline" className="w-full">
                                Create an account
                            </Button>
                        </Link>
                    </div>
                </div>
            </CardContent>
        </Card>
    </div>
  )
}