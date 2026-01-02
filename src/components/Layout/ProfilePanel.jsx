import { useEffect, useState } from "react";
import { X, LogOut, Upload, Eye, EyeOff } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { logout, updatePassword, updateProfile } from "../../store/slices/authSlice";
import { toggleAuthPopup } from "../../store/slices/popupSlice";

const ProfilePanel = () => {
  const dispatch = useDispatch()
  const {isAuthPopupOpen} = useSelector((state)=>state.popup)
  const {authUser,isUpdatingPassword,isUpdatingProfile} = useSelector((state)=>state.auth)

  
  
  const [name, setName] = useState(authUser?.name || "")
  const [email, setEmail] = useState(authUser?.email || "" )
  const [avatar, setAvatar] = useState(null)
  
  useEffect(() => {
    if(authUser){
      setName(authUser?.name || "")
      setEmail(authUser?.email || "")
    }
  }, [authUser])

  const [showPassword, setShowPassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")

  const handleLogout = ()=>{
    dispatch(logout())
  }

  const handleUpdateProfile = ()=>{
    const formData = new FormData()
    formData.append("name",name)
    formData.append("email",email)
    if(avatar) formData.append("avatar",avatar)
    dispatch(updateProfile(formData))
  }

   const handleUpdatePassword = ()=>{
    const formData = new FormData()
    formData.append("currentPassword",currentPassword)
    formData.append("newPassword",newPassword)
    formData.append("confirmNewPassword",confirmNewPassword)
    dispatch(updatePassword(formData))
  }

  if(!isAuthPopupOpen || !authUser) return null

  return <>
  {/* OVERLAY */}
  <div className="fixed inset-0 --inset-bg backdrop-blur-sm z-40" 
     onClick={()=>dispatch(toggleAuthPopup())}
     >
      
  </div>

  {/* PROFILE */}
  <div className="fixed right-0 top-0 w-96 h-full z-40 glass-panel animate-slide-in-right overflow-y-auto overflow-x-hidden" onClick={(e)=>{e.stopPropagation()}}>
            <div className="flex items-center justify-between pt-14 pb-4 border-b border-[hsla(var(--glass-border))]" onClick={(e)=>{e.stopPropagation()}}>
              <h2 className="text-xl font-semibold text-primary">User Profile</h2>
              <button className="p-2 rounded-lg glass-card hover:glow-on-hover animate-smooth animate-slide-in-left"
                          onClick={()=>dispatch(toggleAuthPopup())}
                          >
                            <X className="h-5 w-5 text-primary" />
              </button>
            </div>

            <div className="p-6">
              {/* AVATAR BASIC */}
              <div className="text-center mb-6">
                <img src={authUser?.avatar?.url || "/avatar-holder.avif"} alt={authUser?.name}
                className="w-20 h-20 rounded-full mx-auto mb-4 border-2 border-primary object-cover" />
                <h3 className="text-lg text-foreground font-semibold">{authUser?.name}</h3>
                <p className="text-muted-foreground">{authUser?.email}</p>
              </div>
              
              {/* UPDATING PROFILE */}
              {authUser && (
                <div className="space-y-4 mb-8 ">
                  <h3 className="text-lg font-semibold text-primary">Update Profile</h3>
                  <input 
                  type="text"
                  placeholder="Full name"
                  value={name}
                  onChange={(e)=>{setName(e.target.value)}}  
                  className="w-full p-2 rounded border border-border bg-secondary text-foreground"  />
                  <input 
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e)=>{setName(e.target.value)}}  
                  className="w-full p-2 rounded border border-border bg-secondary text-foreground"   />
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground">
                    <Upload className="w-4 h-4 text-primary" />
                    <span>Upload Avatar</span>
                    <input type="file" accept="/image" onChange={(e)=>setAvatar(e.target.files[0])} className="hiden" />
                  </label>
                  <button
                  className="flex items-center justify-center space-x-3 p-3 rounded-lg glass-card hover:glow-on-hover animate-smooth group w-full"
                  onClick={handleUpdateProfile}>
                    {isUpdatingProfile ? (<>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                      <span>Updating Profile...</span>
                      </>
                    ):("Save changes")}
                  </button>
                </div>
              )}

              {/* UPDATING PASSWORD */}
              <div className="space-y-4 mb-8 ">
                  <h3 className="text-lg font-semibold text-primary">Update Password</h3>
                  <input 
                  type={showPassword ? "text" : "password"}
                  placeholder="Current Password"
                  value={currentPassword}
                  onChange={(e)=>{setCurrentPassword(e.target.value)}}  
                  className="w-full p-2 rounded border border-border bg-secondary text-foreground"  />
                  <input 
                  type={showPassword ? "text" : "password"}
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e)=>{setNewPassword(e.target.value)}}  
                  className="w-full p-2 rounded border border-border bg-secondary text-foreground"  />
                  <input 
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  value={confirmNewPassword}
                  onChange={(e)=>{setConfirmNewPassword(e.target.value)}}  
                  className="w-full p-2 rounded border border-border bg-secondary text-foreground"  />
                  <button className="text-xs text-muted-foreground flex items-center gap-1" onClick={()=>setShowPassword(!showPassword)}>
                    {
                      showPassword ? (
                        <EyeOff className="w-4 h-4 text-primary"/>
                      ):(<Eye className="w-4 h-4 text-primary "/>)
                    }
                    {showPassword ? "Hide" : "Show"} Passwords

                  </button>
                  <button
                  onClick={handleUpdatePassword}
                  className="flex items-center justify-center space-x-3 p-3 rounded-lg glass-card hover:glow-on-hover animate-smooth group w-full"
                  >
                    {isUpdatingPassword ? (<>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                      <span>Updating Password...</span>
                      </>
                    ):("Update Password")}
                  </button>
                </div>

                <button 
                className="my-6 flex items-center space-x-3 p-3 rounded-lg glass-card hover:glow-on-hover text-destructive hover:text-destructive-foreground group w-full"
                onClick={handleLogout}>
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
            </div>
          </div>
  </>;
};

export default ProfilePanel;
