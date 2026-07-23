import { CreateAccountForm } from "@/components/auth/create-account-form";

export default function CreateAccountPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="mb-8 font-display text-2xl font-semibold text-navy-900 dark:text-white">
        Create Account
      </h1>
      <CreateAccountForm />
    </div>
  );
}
