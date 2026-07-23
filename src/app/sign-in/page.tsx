import { SignInForm } from "@/components/auth/sign-in-form";

export default function SignInPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="mb-8 font-display text-2xl font-semibold text-navy-900 dark:text-white">
        Sign In
      </h1>
      <SignInForm />
    </div>
  );
}
