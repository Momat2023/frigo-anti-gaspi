import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../ui/Header'
import Button from '../ui/Button'

export default function Onboarding() {
  const navigate = useNavigate()

  useEffect(() => {
    const alreadyOnboarded = localStorage.getItem('onboardingDone') === '1'
    if (alreadyOnboarded) {
      navigate('/home', { replace: true })
    }
  }, [navigate])

  const finishOnboarding = () => {
    localStorage.setItem('onboardingDone', '1')
    navigate('/home', { replace: true })
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 px-4 py-6 space-y-6">
        <section className="space-y-2">
          <h1 className="text-2xl font-semibold">Bienvenue 👋</h1>
          <p className="text-sm text-gray-600">
            Ajoute quelques aliments pour que l’app t’aide à les consommer à temps.
          </p>
        </section>

        <section className="space-y-4">
          <div className="p-4 rounded-xl bg-green-50 border border-green-100">
            <h2 className="font-medium mb-1">1. Ajoute ce qu’il y a dans ton frigo</h2>
            <p className="text-sm text-gray-600">Commence par 3–5 aliments que tu veux vraiment sauver.</p>
          </div>

          <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
            <h2 className="font-medium mb-1">2. Vois qui est à consommer d’abord</h2>
            <p className="text-sm text-gray-600">
              La page d’accueil te montre en premier ce qui est le plus urgent.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
            <h2 className="font-medium mb-1">3. Reçois des rappels utiles</h2>
            <p className="text-sm text-gray-600">
              Tu peux ajouter des rappels dans ton calendrier pour ne rien oublier.
            </p>
          </div>
        </section>
      </main>

      <div className="px-4 pb-6">
        <Button onClick={finishOnboarding}>
          Commencer et ajouter des aliments
        </Button>
      </div>
    </div>
  )
}
