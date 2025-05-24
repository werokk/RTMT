import { useState } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Navbar } from '@/components/layout/navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTheme } from '@/lib/themes';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sun, Moon, LaptopIcon, KeyRound, Shield, DatabaseIcon, Share2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

export default function Settings() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  
  // State for form fields
  const [profileForm, setProfileForm] = useState({
    full_name: 'John Doe',
    email: 'john@example.com',
    username: 'johndoe'
  });
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirm_password: ''
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    testFailureAlerts: true,
    dailySummary: false,
    weeklyReport: true
  });
  
  const [apiSettings, setApiSettings] = useState({
    groqApiKey: process.env.GROQ_API_KEY || ''
  });
  
  // Handle profile form update
  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    // API call would go here
    toast({
      title: 'Profile Updated',
      description: 'Your profile information has been updated successfully',
    });
  };
  
  // Handle password form update
  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (passwordForm.newPassword !== passwordForm.confirm_password) {
      toast({
        title: 'Password Error',
        description: 'New passwords do not match',
        variant: 'destructive',
      });
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      toast({
        title: 'Password Error',
        description: 'Password must be at least 6 characters long',
        variant: 'destructive',
      });
      return;
    }
    
    // API call would go here
    toast({
      title: 'Password Updated',
      description: 'Your password has been updated successfully',
    });
    
    // Reset password fields
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirm_password: ''
    });
  };
  
  // Handle toggle for notification settings
  const handleNotificationToggle = (key: keyof typeof notificationSettings) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  
  // Handle API settings update
  const handleApiSettingsUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    // API call would go here
    toast({
      title: 'API Settings Updated',
      description: 'Your API settings have been updated successfully',
    });
  };
  
  return (
    <div className="min-h-screen flex bg-neutral-50 dark:bg-neutral-900">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar title="Settings" onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="space-y-6 max-w-4xl mx-auto">
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid grid-cols-5 mb-6">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="appearance">Appearance</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="api">API</TabsTrigger>
              </TabsList>
              
              {/* Profile Tab */}
              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl font-medium text-neutral-700 dark:text-neutral-300">Profile</CardTitle>
                    <CardDescription className="text-neutral-500 dark:text-neutral-400">
                      Manage your personal information
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleProfileUpdate} className="space-y-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex flex-col items-center space-y-3">
                          <Avatar className="h-24 w-24">
                            <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" />
                            <AvatarFallback>JD</AvatarFallback>
                          </Avatar>
                          <Button 
                            type="button" 
                            variant="outline"
                            className="mt-2 dark:border-neutral-700 dark:text-neutral-300 dark:bg-neutral-800"
                          >
                            Change Avatar
                          </Button>
                        </div>
                        <div className="flex-1 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="full_name">Full Name</Label>
                              <Input 
                                id="full_name" 
                                value={profileForm.full_name} 
                                onChange={e => setProfileForm({...profileForm, full_name: e.target.value})}
                                className="dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-300"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="username">Username</Label>
                              <Input 
                                id="username" 
                                value={profileForm.username} 
                                onChange={e => setProfileForm({...profileForm, username: e.target.value})}
                                className="dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-300"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input 
                              id="email" 
                              type="email" 
                              value={profileForm.email} 
                              onChange={e => setProfileForm({...profileForm, email: e.target.value})}
                              className="dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-300"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button 
                          type="submit"
                          className="bg-primary-600 hover:bg-primary-700 text-white dark:bg-primary-700 dark:hover:bg-primary-600"
                        >
                          Save Changes
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Security Tab */}
              <TabsContent value="security">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl font-medium text-neutral-700 dark:text-neutral-300">
                      <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary-500" />
                        <span>Security</span>
                      </div>
                    </CardTitle>
                    <CardDescription className="text-neutral-500 dark:text-neutral-400">
                      Manage your password and account security
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <form onSubmit={handlePasswordUpdate} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input 
                          id="currentPassword" 
                          type="password" 
                          value={passwordForm.currentPassword} 
                          onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                          className="dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-300"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="newPassword">New Password</Label>
                          <Input 
                            id="newPassword" 
                            type="password" 
                            value={passwordForm.newPassword} 
                            onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                            className="dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-300"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirm_password">Confirm New Password</Label>
                          <Input 
                            id="confirm_password" 
                            type="password" 
                            value={passwordForm.confirm_password} 
                            onChange={e => setPasswordForm({...passwordForm, confirm_password: e.target.value})}
                            className="dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-300"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button 
                          type="submit"
                          className="bg-primary-600 hover:bg-primary-700 text-white dark:bg-primary-700 dark:hover:bg-primary-600"
                        >
                          <KeyRound className="h-4 w-4 mr-2" />
                          Update Password
                        </Button>
                      </div>
                    </form>
                    
                    <Separator className="my-6" />
                    
                    <div>
                      <h3 className="text-lg font-medium text-neutral-700 mb-4 dark:text-neutral-300">Session Management</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center py-2">
                          <div>
                            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Current Session</p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">Started 2 hours ago • Chrome on Windows</p>
                          </div>
                          <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20">
                            Sign Out
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Appearance Tab */}
              <TabsContent value="appearance">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl font-medium text-neutral-700 dark:text-neutral-300">Appearance</CardTitle>
                    <CardDescription className="text-neutral-500 dark:text-neutral-400">
                      Customize how TestSphere looks and feels
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-neutral-700 dark:text-neutral-300">Theme</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div 
                          className={`flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer hover:border-primary-500 transition-colors ${theme === 'light' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-neutral-200 dark:border-neutral-700'}`}
                          onClick={() => setTheme('light')}
                        >
                          <Sun className="h-8 w-8 mb-2 text-primary-500" />
                          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Light</span>
                        </div>
                        <div 
                          className={`flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer hover:border-primary-500 transition-colors ${theme === 'dark' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-neutral-200 dark:border-neutral-700'}`}
                          onClick={() => setTheme('dark')}
                        >
                          <Moon className="h-8 w-8 mb-2 text-primary-500" />
                          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Dark</span>
                        </div>
                        <div 
                          className={`flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer hover:border-primary-500 transition-colors ${theme === 'system' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-neutral-200 dark:border-neutral-700'}`}
                          onClick={() => setTheme('system')}
                        >
                          <LaptopIcon className="h-8 w-8 mb-2 text-primary-500" />
                          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">System</span>
                        </div>
                      </div>
                    </div>
                    
                    <Separator className="my-6" />
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-neutral-700 dark:text-neutral-300">Interface Density</h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="dense-ui" className="flex items-center space-x-2">
                            <span>Compact Interface</span>
                            <span className="text-xs text-neutral-500 dark:text-neutral-400">(Reduces spacing for more content)</span>
                          </Label>
                          <Switch id="dense-ui" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Notifications Tab */}
              <TabsContent value="notifications">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl font-medium text-neutral-700 dark:text-neutral-300">Notifications</CardTitle>
                    <CardDescription className="text-neutral-500 dark:text-neutral-400">
                      Configure how you want to be notified
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="email-notifications" className="flex flex-col">
                          <span className="font-medium">Email Notifications</span>
                          <span className="text-xs text-neutral-500 dark:text-neutral-400">Receive notifications via email</span>
                        </Label>
                        <Switch 
                          id="email-notifications" 
                          checked={notificationSettings.emailNotifications}
                          onCheckedChange={() => handleNotificationToggle('emailNotifications')}
                        />
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="test-failure-alerts" className="flex flex-col">
                          <span className="font-medium">Test Failure Alerts</span>
                          <span className="text-xs text-neutral-500 dark:text-neutral-400">Get alerts when tests fail</span>
                        </Label>
                        <Switch 
                          id="test-failure-alerts" 
                          checked={notificationSettings.testFailureAlerts}
                          onCheckedChange={() => handleNotificationToggle('testFailureAlerts')}
                        />
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="daily-summary" className="flex flex-col">
                          <span className="font-medium">Daily Summary</span>
                          <span className="text-xs text-neutral-500 dark:text-neutral-400">Receive a daily summary of test results</span>
                        </Label>
                        <Switch 
                          id="daily-summary" 
                          checked={notificationSettings.dailySummary}
                          onCheckedChange={() => handleNotificationToggle('dailySummary')}
                        />
                      </div>
                      
                      <Separator />
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="weekly-report" className="flex flex-col">
                          <span className="font-medium">Weekly Report</span>
                          <span className="text-xs text-neutral-500 dark:text-neutral-400">Receive a weekly report every Monday</span>
                        </Label>
                        <Switch 
                          id="weekly-report" 
                          checked={notificationSettings.weeklyReport}
                          onCheckedChange={() => handleNotificationToggle('weeklyReport')}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* API Tab */}
              <TabsContent value="api">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl font-medium text-neutral-700 dark:text-neutral-300">
                      <div className="flex items-center gap-2">
                        <DatabaseIcon className="h-5 w-5 text-primary-500" />
                        <span>API Settings</span>
                      </div>
                    </CardTitle>
                    <CardDescription className="text-neutral-500 dark:text-neutral-400">
                      Manage your API keys and integration settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <form onSubmit={handleApiSettingsUpdate} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="groq-api-key">
                          Groq API Key
                          <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            Connected
                          </span>
                        </Label>
                        <div className="flex">
                          <Input 
                            id="groq-api-key" 
                            type="password" 
                            value={apiSettings.groqApiKey} 
                            placeholder="Enter your Groq API key"
                            onChange={e => setApiSettings({...apiSettings, groqApiKey: e.target.value})}
                            className="rounded-r-none dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-300"
                          />
                          <Button 
                            type="button" 
                            className="rounded-l-none"
                            variant="outline"
                            onClick={() => {
                              navigator.clipboard.writeText(apiSettings.groqApiKey);
                              toast({
                                title: 'Copied',
                                description: 'API key copied to clipboard',
                              });
                            }}
                          >
                            Copy
                          </Button>
                        </div>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          Used for AI-powered test case generation. Get your API key from <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline dark:text-primary-400">Groq Console</a>.
                        </p>
                      </div>
                      
                      <Separator className="my-6" />
                      
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium text-neutral-700 dark:text-neutral-300">
                          <div className="flex items-center gap-2">
                            <Share2 className="h-5 w-5 text-primary-500" />
                            <span>Integration Settings</span>
                          </div>
                        </h3>
                        
                        <div className="space-y-2">
                          <Label htmlFor="integration-mode">Integration Mode</Label>
                          <Select defaultValue="auto">
                            <SelectTrigger id="integration-mode" className="dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-300">
                              <SelectValue placeholder="Select integration mode" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="auto">Automatic (Recommended)</SelectItem>
                              <SelectItem value="manual">Manual</SelectItem>
                              <SelectItem value="disabled">Disabled</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            Controls how TestSphere integrates with external systems
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button 
                          type="submit"
                          className="bg-primary-600 hover:bg-primary-700 text-white dark:bg-primary-700 dark:hover:bg-primary-600"
                        >
                          Save API Settings
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
