import { ProfileDesktop } from "./ProfileDesktop"
import { ProfileMobile } from "./ProfileMobile"

const Profile: React.FC = () => {
  
  return (
    <>
      <div className="hidden md:block"><ProfileDesktop /></div>
      <div className="md:hidden"><ProfileMobile /></div>
    </>
  )
}

export default Profile