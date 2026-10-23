'use client'

import { useState } from 'react'
import { LayoutDashboard, ListOrdered, Gamepad2, Users } from 'lucide-react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AdminDashboard } from '@/components/platform/admin-dashboard'
import { AdminUsers } from '@/components/platform/admin-users'
import { AdminGames } from '@/components/platform/admin-games'
import { AdminLevels } from '@/components/platform/admin-levels'
import { AdminDevDocs } from '@/components/platform/admin-dev-docs'

export function AdminPanel() {
  const [tab, setTab] = useState('dashboard')

  return (
    <main className="flex-1 pt-20 pb-28 bg-[#0B0F19] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2">
              <span className="eg-gradient-bg text-black rounded-lg p-2">
                <LayoutDashboard className="size-6" />
              </span>
              Panel Admin <span className="eg-gold-text">EarnGames</span>
            </h1>
            <p className="text-gray-400 mt-1 text-sm">
              Kelola pengguna, game, dan level platform.
            </p>
          </div>
          <AdminDevDocs />
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="bg-[#151b28] border border-white/8 h-auto p-1 flex flex-wrap">
            <TabsTrigger value="dashboard" className="gap-1.5 data-[state=active]:eg-gradient-bg data-[state=active]:text-black data-[state=active]:shadow-none text-gray-400">
              <LayoutDashboard className="size-4" /> Dashboard
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-1.5 data-[state=active]:eg-gradient-bg data-[state=active]:text-black data-[state=active]:shadow-none text-gray-400">
              <Users className="size-4" /> Pengguna
            </TabsTrigger>
            <TabsTrigger value="games" className="gap-1.5 data-[state=active]:eg-gradient-bg data-[state=active]:text-black data-[state=active]:shadow-none text-gray-400">
              <Gamepad2 className="size-4" /> Game
            </TabsTrigger>
            <TabsTrigger value="levels" className="gap-1.5 data-[state=active]:eg-gradient-bg data-[state=active]:text-black data-[state=active]:shadow-none text-gray-400">
              <ListOrdered className="size-4" /> Level
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <AdminDashboard />
          </TabsContent>
          <TabsContent value="users" className="mt-6">
            <AdminUsers />
          </TabsContent>
          <TabsContent value="games" className="mt-6">
            <AdminGames />
          </TabsContent>
          <TabsContent value="levels" className="mt-6">
            <AdminLevels />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
