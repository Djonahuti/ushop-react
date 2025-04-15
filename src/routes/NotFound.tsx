import { cn } from "@/lib/utils";

export default function NotFound({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <div className={cn("flex flex-col gap-6", className)} {...props}>
            <div className=" justify text-center">
              <h1 className="mb-4 text-6xl font-semibold text-red-500">404</h1>
              <p className="mb-4 text-lg text-gray-600">Oops! Looks like you're lost.</p>
              <div className="animate-bounce">
                <svg className="mx-auto h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                </svg>
              </div>
              <p className="mt-4 text-gray-600">Let's get you back <a href="/" className="text-blue-500">Home</a>.</p>
            </div>
          </div>
        </div>

      </div>

    )
  }
  