import { Outlet } from "react-router-dom"

const AuthLayout = () => {
  return (
    <>
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="/" className="flex items-center gap-2 self-center font-medium">
          <div className="flex h-10 w-140 items-center justify-center">
            <img
              src="/logo/ushop.svg"
              alt="logo"
            />
          </div>
        </a>

        <section>
          <Outlet />
        </section>
      </div>
    </div>
    </>
  )
}

export default AuthLayout