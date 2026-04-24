import { ButtonComponent } from "@syncfusion/ej2-react-buttons"
import { useNavigate } from "react-router";
import { logoutUser } from "~/appwrite/auth";

const travelPage = () => {

    const navigate = useNavigate();
    const socials = [
        {
            name: 'LinkedIn',
            url: 'https://www.linkedin.com/in/aleks-mopinadze-2b6522370/',
            icon: '/assets/icons/linkedIn.svg'
        },
        {
            name: 'Github',
            url: 'https://github.com/Aleks-Mopinadze/Tourvisto',
            icon: '/assets/icons/github.svg'
        }
    ]

    const handleLogOut = async () => {
        await logoutUser();
        navigate('/sign-in');
    }

  return (
    
    <main className="auth">
        <section className="size-full glassmorphism flex-center px-6">
            <div className="sign-in-card">
                <header className="header">
                    <img src="/assets/icons/logo.svg" alt="Logo" className="size-[30px]" />
                    <h1 className="p-28-bold text-dark-100">Tourvisto</h1>
                </header>
                <div className="mt-5 text-dark-100 text-center">
                    <div className="text-2xl font-semibold">
                     Welcome to the Tourovistos user homepage! 
                    </div>
                <div>
                     This page is currently under development.
                     To access the dashboard and generate travel tours, admin privileges are <span className="text-red-500">Required</span>.
                </div> 

                <div>
                    Please contact us for access:
                    <div>
                        <ul className="flex items-center justify-center gap-2">
                            {socials.map((social, index) => (
                                <li key={index}>
                                    <a href={social.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 justify-center mt-2">
                                        <img src={social.icon} alt={social.name} className='size-10'/>
                                    </a>
                            </li>))
                            }
                        </ul>
                    </div>
                </div>
            </div>
            <div>
                <div className="mt-5 flex justify-center ">
                    <ButtonComponent cssClass="bg-red-500! text-white!" onClick={handleLogOut}>Log Out</ButtonComponent>
                </div>
            </div>
            </div>
        </section>
    </main>
  )
}

export default travelPage