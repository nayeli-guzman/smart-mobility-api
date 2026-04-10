import { useEffect, useState } from 'react'
import AppShell from '../components/layout/AppShell'
import SectionTitle from '../components/ui/SectionTitle'
import Card from '../components/ui/Card'
import Select from '../components/ui/Select'
import Toggle from '../components/ui/Toggle'
import Button from '../components/ui/Button'
import { useAuth } from '../hooks/useAuth'
import { getUser, updateUserPreferences } from '../api/user'
import type { UpdatePreferencesPayload, UserProfile } from '../types/api'

export default function ProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [preferences, setPreferences] = useState<UpdatePreferencesPayload>({
    transportMode: 'car',
    avoidCongestion: true,
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function loadProfile() {
      if (!user?.userId) return

      try {
        const data = await getUser(user.userId)
        setProfile(data)
        setPreferences({
          transportMode: data.preferences?.transportMode ?? 'car',
          avoidCongestion: data.preferences?.avoidCongestion ?? true,
        })
      } catch {
        setProfile({
          userId: user.userId,
          email: user.email,
          preferences: {
            transportMode: 'car',
            avoidCongestion: true,
          },
        })
      }
    }

    void loadProfile()
  }, [user])

  const handleSave = async () => {
    if (!user?.userId) return

    setSaving(true)
    setMessage('')

    try {
      await updateUserPreferences(user.userId, preferences)
      setMessage('Preferences updated successfully.')
    } catch {
      setMessage('Backend not responding or payload shape differs. UI is ready; adjust handler if needed.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AppShell>
      <SectionTitle title="Profile" subtitle="View your account and update mobility preferences." />

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <h3 className="mb-4 text-xl font-semibold text-white">Account Information</h3>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-400">User ID</p>
              <p className="text-white break-all">{profile?.userId ?? user?.userId}</p>
            </div>

            <div>
              <p className="text-sm text-slate-400">Email</p>
              <p className="text-white">{profile?.email ?? user?.email}</p>
            </div>

            <div>
              <p className="text-sm text-slate-400">Role</p>
              <p className="text-white">{user?.isAdmin ? 'Administrator' : 'Standard User'}</p>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="mb-4 text-xl font-semibold text-white">Mobility Preferences</h3>

          <div className="space-y-4">
            <Select
              label="Preferred Transport Mode"
              value={preferences.transportMode}
              onChange={(e) =>
                setPreferences((prev) => ({ ...prev, transportMode: e.target.value }))
              }
            >
              <option value="car">Car</option>
              <option value="bus">Bus</option>
              <option value="metro">Metro</option>
              <option value="bike">Bike</option>
              <option value="walking">Walking</option>
            </Select>

            <Toggle
              label="Avoid congestion whenever possible"
              checked={preferences.avoidCongestion}
              onChange={(value) =>
                setPreferences((prev) => ({ ...prev, avoidCongestion: value }))
              }
            />

            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Preferences'}
            </Button>

            {message && (
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                {message}
              </div>
            )}
          </div>
        </Card>
      </div>
    </AppShell>
  )
}