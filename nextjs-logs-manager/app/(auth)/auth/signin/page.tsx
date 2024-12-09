/* eslint-disable tailwindcss/no-custom-classname */
"use client";
import {
  SignInWithCredentialsInput,
  signInWithCredentialsSchema,
} from "@/schema/user.schema";
import { NextPage } from "next";
import { signIn, useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

const errors: Record<string, string> = {
  Signin: "Try signing in with a different account.",
  OAuthSignin: "Try signing in with a different account.",
  OAuthCallback: "Try signing in with a different account.",
  OAuthCreateAccount: "Try signing in with a different account.",
  EmailCreateAccount: "Try signing in with a different account.",
  Callback: "Try signing in with a different account.",
  OAuthAccountNotLinked:
    "To confirm your identity, sign in with the same account you used originally.",
  EmailSignin: "The e-mail could not be sent.",
  CredentialsSignin:
    "Sign in failed. Check the details you provided are correct.",
  SessionRequired: "Please sign in to access this page.",
  default: "Unable to sign in.",
};

type SigninOptions = "credentials";

type LoadingState = Record<SigninOptions, boolean>;

const SignInPage: NextPage = ({
  params: { callbackUrl, error: errorType },
}: any) => {
  const session = useSession();

  useEffect(() => {
    if (session.status === "authenticated") {
      redirect("/");
    }
  }, [session]);

  const [isLoading, setIsLoading] = useState<LoadingState>({
    credentials: false,
  });

  const getDisabledState = (type: SigninOptions) => {
    return Object.entries(isLoading).some(([key, value]) => {
      return key !== type && value === true;
    });
  };

  const { handleSubmit, register } = useForm<SignInWithCredentialsInput>({
    resolver: zodResolver(signInWithCredentialsSchema),
  });

  const error = errorType && (errors[errorType] ?? errors.default);

  const onCredentialsSubmit = useCallback(
    async (values: SignInWithCredentialsInput) => {
      setIsLoading((prev) => ({ ...prev, email: true }));

      await signIn("credentials", {
        callbackUrl: callbackUrl || "/",
        username: values.username,
        password: values.password,
      });

      setIsLoading((prev) => ({ ...prev, email: false }));
    },
    [callbackUrl],
  );

  return (
    <>
      <div className="relative mx-auto h-screen max-w-6xl px-4 sm:px-6">
        <div className="pb-12 pt-32 md:pb-20 md:pt-40">
          <div className="mx-auto max-w-3xl pb-12 text-center">
            <h1 className="text-4xl font-semibold text-white drop-shadow-md">
              Welcome back!
            </h1>
          </div>

          <form
            className="mx-auto max-w-sm"
            onSubmit={handleSubmit(onCredentialsSubmit)}
          >
            <div className="mb-5">
              <input
                type="email"
                id="email"
                className="focus:border-accent focus:ring-accent dark:focus:border-accent dark:focus:ring-accent block w-full rounded-lg border-none bg-gray-50 p-2.5 text-sm text-gray-900 dark:bg-white dark:bg-opacity-40 dark:text-white dark:placeholder-gray-600"
                placeholder="name@flowbite.com"
                required
                disabled={isLoading.credentials}
                {...register("username")}
              />
            </div>
            <div className="mb-5">
              <input
                type="password"
                id="password"
                placeholder="Password"
                className="focus:border-accent focus:ring-accent dark:focus:border-accent dark:focus:ring-accent block w-full rounded-lg border-none bg-gray-50 p-2.5 text-sm text-gray-900 dark:bg-white dark:bg-opacity-40 dark:text-white dark:placeholder-gray-600"
                autoComplete="on"
                required
                disabled={isLoading.credentials}
                {...register("password")}
              />
            </div>

            <button
              type="submit"
              className="bg-accent2 hover:bg-accent w-full rounded-lg px-5 py-2.5 text-center text-sm font-medium text-white focus:outline-none focus:ring-4 focus:ring-blue-300"
              disabled={getDisabledState("credentials")}
            >
              Sign In{" "}
              <span className="ml-1 tracking-normal text-sky-300 transition-transform duration-150 ease-in-out group-hover:translate-x-0.5">
                -&gt;
              </span>
            </button>
            <span className="text-sm text-red-500">{error}</span>
          </form>
        </div>
      </div>
    </>
  );
};

export default SignInPage;