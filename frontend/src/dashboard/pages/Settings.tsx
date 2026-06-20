import { useState } from "react";
import {
  FaSave,
  FaEye,
  FaEyeSlash,
  FaShieldAlt,
  FaBell,
  FaDatabase,
  FaEnvelope,
  FaGlobe,
  FaUser,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import {
  useChangePasswordMutation,
  useChangeEmailMutation,
  useChangeUsernameMutation,
} from "../../redux/api/api";
import { removeUserLocalStorage, useUserVerification } from "../../auth/auth";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const navigate = useNavigate();
  const user = useUserVerification();
  const [activeTab, setActiveTab] = useState("account");
  const [showPassword, setShowPassword] = useState(false);

  // Account management mutations
  const [changePassword, { isLoading: isPasswordLoading }] =
    useChangePasswordMutation();
  const [changeEmail, { isLoading: isEmailLoading }] = useChangeEmailMutation();
  const [changeUsername, { isLoading: isUsernameLoading }] =
    useChangeUsernameMutation();

  // Form hooks for account management
  const passwordForm = useForm();
  const emailForm = useForm();
  const usernameForm = useForm();

  const [settings, setSettings] = useState({
    // General Settings
    siteName: "Système Retrouver",
    siteDescription: "Un système complet de gestion des objets perdus et trouvés",
    contactEmail: "contact@lostandfound.com",
    supportEmail: "support@lostandfound.com",
    siteUrl: "https://lostandfound.com",
    timezone: "Europe/Paris",
    language: "fr",

    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    newItemNotifications: true,
    claimNotifications: true,
    reminderNotifications: true,

    // Security Settings
    enableTwoFactor: false,
    passwordExpiry: 90,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    requirePasswordChange: true,

    // System Settings
    itemExpiryDays: 30,
    maxImageSize: 5,
    allowedFileTypes: ["jpg", "jpeg", "png", "gif"],
    autoDeleteExpiredItems: true,
    requireItemApproval: false,

    // Email Settings
    smtpHost: "smtp.gmail.com",
    smtpPort: 587,
    smtpUsername: "",
    smtpPassword: "",
    smtpSecure: true,
    fromName: "Système Retrouver",
    fromEmail: "noreply@lostandfound.com",
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = () => {
    // Here you would typically send the settings to your backend
    toast.success("Paramètres enregistrés avec succès");
  };

  const handleTestEmail = () => {
    // Here you would test the email configuration
    toast.info("Test de la configuration e-mail…");
    setTimeout(() => {
      toast.success("Test e-mail réussi !");
    }, 2000);
  };

  // Account management handlers
  const handleChangePassword = async (data: any) => {
    try {
      const res: any = await changePassword(data);
      if (res?.error?.data?.message) {
        toast.error(res?.error?.data?.message);
        return;
      }
      if (res?.data?.statusCode === 200) {
        toast.success("Mot de passe modifié avec succès !");
        passwordForm.reset();
      }
    } catch (err: any) {
      toast.error("Échec de la modification du mot de passe.");
    }
  };

  const handleChangeEmail = async (data: any) => {
    try {
      const res: any = await changeEmail(data);
      if (res?.error?.data?.message) {
        toast.error(res?.error?.data?.message);
        return;
      }
      if (res?.data?.statusCode === 200) {
        toast.success(
          `E-mail modifié avec succès ! Votre nouvel e-mail est ${data.email}. Veuillez vous reconnecter.`
        );
        emailForm.reset();
        removeUserLocalStorage();
        navigate("/login");
      }
    } catch (err: any) {
      toast.error("Échec de la modification de l'e-mail.");
    }
  };

  const handleChangeUsername = async (data: any) => {
    try {
      const res: any = await changeUsername(data);
      if (res?.error?.data?.message) {
        toast.error(res?.error?.data?.message);
        return;
      }
      if (res?.data?.statusCode === 200) {
        toast.success(
          `Nom d'utilisateur modifié avec succès ! Votre nouveau nom d'utilisateur est ${data.username}. Veuillez vous reconnecter.`
        );
        usernameForm.reset();
        removeUserLocalStorage();
        navigate("/login");
      }
    } catch (err: any) {
      toast.error("Échec de la modification du nom d'utilisateur.");
    }
  };

  const tabs = [
    { id: "account", label: "Compte", icon: <FaUser /> },
    { id: "general", label: "Général", icon: <FaGlobe /> },
    { id: "notifications", label: "Notifications", icon: <FaBell /> },
    { id: "security", label: "Sécurité", icon: <FaShieldAlt /> },
    { id: "system", label: "Système", icon: <FaDatabase /> },
    { id: "email", label: "E-mail", icon: <FaEnvelope /> },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Paramètres</h1>
          <p className="text-gray-400 mt-1">
            Configurer les paramètres et préférences du système
          </p>
        </div>
        <button
          onClick={handleSave}
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <FaSave className="mr-2" />
          Enregistrer
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-1/4">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-2">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  <span className="mr-3">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:w-3/4">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            {/* General Settings */}
            {activeTab === "general" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white">
                  Paramètres généraux
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nom du site
                    </label>
                    <input
                      type="text"
                      value={settings.siteName}
                      onChange={(e) =>
                        handleSettingChange("siteName", e.target.value)
                      }
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      E-mail de contact
                    </label>
                    <input
                      type="email"
                      value={settings.contactEmail}
                      onChange={(e) =>
                        handleSettingChange("contactEmail", e.target.value)
                      }
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      E-mail d'assistance
                    </label>
                    <input
                      type="email"
                      value={settings.supportEmail}
                      onChange={(e) =>
                        handleSettingChange("supportEmail", e.target.value)
                      }
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      URL du site
                    </label>
                    <input
                      type="url"
                      value={settings.siteUrl}
                      onChange={(e) =>
                        handleSettingChange("siteUrl", e.target.value)
                      }
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Fuseau horaire
                    </label>
                    <select
                      value={settings.timezone}
                      onChange={(e) =>
                        handleSettingChange("timezone", e.target.value)
                      }
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="UTC">UTC</option>
                      <option value="Europe/Paris">Heure de Paris</option>
                      <option value="America/New_York">Heure de l'Est</option>
                      <option value="America/Chicago">Heure du Centre</option>
                      <option value="America/Denver">Heure des Rocheuses</option>
                      <option value="America/Los_Angeles">Heure du Pacifique</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Langue
                    </label>
                    <select
                      value={settings.language}
                      onChange={(e) =>
                        handleSettingChange("language", e.target.value)
                      }
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="fr">Français</option>
                      <option value="en">Anglais</option>
                      <option value="es">Espagnol</option>
                      <option value="de">Allemand</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description du site
                  </label>
                  <textarea
                    value={settings.siteDescription}
                    onChange={(e) =>
                      handleSettingChange("siteDescription", e.target.value)
                    }
                    rows={3}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {/* Account Settings */}
            {activeTab === "account" && (
              <div className="space-y-8">
                <h2 className="text-xl font-semibold text-white">
                  Gestion du compte
                </h2>

                {/* Change Password Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-white">
                    Modifier le mot de passe
                  </h3>
                  <form
                    onSubmit={passwordForm.handleSubmit(handleChangePassword)}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Mot de passe actuel
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            {...passwordForm.register("currentPassword", {
                              required: "Le mot de passe actuel est requis",
                            })}
                            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Saisir le mot de passe actuel"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3"
                          >
                            {showPassword ? (
                              <FaEyeSlash className="h-4 w-4 text-gray-400" />
                            ) : (
                              <FaEye className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                        {passwordForm.formState.errors.currentPassword && (
                          <p className="text-red-400 text-sm mt-1">
                            {
                              passwordForm.formState.errors.currentPassword
                                ?.message as string
                            }
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Nouveau mot de passe
                        </label>
                        <input
                          type="password"
                          {...passwordForm.register("newPassword", {
                            required: "Le nouveau mot de passe est requis",
                            minLength: {
                              value: 6,
                              message: "Le mot de passe doit comporter au moins 6 caractères",
                            },
                          })}
                          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Saisir le nouveau mot de passe"
                        />
                        {passwordForm.formState.errors.newPassword && (
                          <p className="text-red-400 text-sm mt-1">
                            {
                              passwordForm.formState.errors.newPassword
                                ?.message as string
                            }
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isPasswordLoading}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
                    >
                      {isPasswordLoading ? "Modification…" : "Modifier le mot de passe"}
                    </button>
                  </form>
                </div>

                {/* Change Email Section */}
                <div className="space-y-4 border-t border-gray-700 pt-6">
                  <h3 className="text-lg font-medium text-white">
                    Modifier l'e-mail
                  </h3>
                  <form
                    onSubmit={emailForm.handleSubmit(handleChangeEmail)}
                    className="space-y-4"
                  >
                    <div className="max-w-md">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Nouvelle adresse e-mail
                      </label>
                      <input
                        type="email"
                        {...emailForm.register("email", {
                          required: "L'e-mail est requis",
                          pattern: {
                            value: /^\S+@\S+$/i,
                            message: "Adresse e-mail invalide",
                          },
                        })}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Saisir la nouvelle adresse e-mail"
                      />
                      {emailForm.formState.errors.email && (
                        <p className="text-red-400 text-sm mt-1">
                          {emailForm.formState.errors.email?.message as string}
                        </p>
                      )}
                    </div>

                    <div className="text-sm text-yellow-400">
                      ⚠️ Modifier votre e-mail vous déconnectera et vous devrez
                      vous reconnecter.
                    </div>

                    <button
                      type="submit"
                      disabled={isEmailLoading}
                      className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors"
                    >
                      {isEmailLoading ? "Modification…" : "Modifier l'e-mail"}
                    </button>
                  </form>
                </div>

                {/* Change Username Section */}
                <div className="space-y-4 border-t border-gray-700 pt-6">
                  <h3 className="text-lg font-medium text-white">
                    Modifier le nom d'utilisateur
                  </h3>
                  <form
                    onSubmit={usernameForm.handleSubmit(handleChangeUsername)}
                    className="space-y-4"
                  >
                    <div className="max-w-md">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Nouveau nom d'utilisateur
                      </label>
                      <input
                        type="text"
                        {...usernameForm.register("username", {
                          required: "Le nom d'utilisateur est requis",
                          minLength: {
                            value: 3,
                            message: "Le nom d'utilisateur doit comporter au moins 3 caractères",
                          },
                          pattern: {
                            value: /^[a-zA-Z0-9_]+$/,
                            message:
                              "Le nom d'utilisateur ne peut contenir que des lettres, des chiffres et des tirets bas",
                          },
                        })}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Saisir le nouveau nom d'utilisateur"
                      />
                      {usernameForm.formState.errors.username && (
                        <p className="text-red-400 text-sm mt-1">
                          {
                            usernameForm.formState.errors.username
                              ?.message as string
                          }
                        </p>
                      )}
                    </div>

                    <div className="text-sm text-yellow-400">
                      ⚠️ Modifier votre nom d'utilisateur vous déconnectera et
                      vous devrez vous reconnecter.
                    </div>

                    <button
                      type="submit"
                      disabled={isUsernameLoading}
                      className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg transition-colors"
                    >
                      {isUsernameLoading ? "Modification…" : "Modifier le nom d'utilisateur"}
                    </button>
                  </form>
                </div>

                {/* Current User Info */}
                <div className="space-y-4 border-t border-gray-700 pt-6">
                  <h3 className="text-lg font-medium text-white">
                    Informations du compte actuel
                  </h3>
                  <div className="bg-gray-700 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Nom d'utilisateur :</span>
                      <span className="text-white">
                        {(user as any)?.username || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">E-mail :</span>
                      <span className="text-white">
                        {(user as any)?.email || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Rôle :</span>
                      <span className="text-white capitalize">
                        {(user as any)?.role || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notification Settings */}
            {activeTab === "notifications" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white">
                  Paramètres de notification
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-300">
                        Notifications par e-mail
                      </label>
                      <p className="text-sm text-gray-500">
                        Recevoir des notifications par e-mail
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.emailNotifications}
                      onChange={(e) =>
                        handleSettingChange(
                          "emailNotifications",
                          e.target.checked
                        )
                      }
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-300">
                        Notifications par SMS
                      </label>
                      <p className="text-sm text-gray-500">
                        Recevoir des notifications par SMS
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.smsNotifications}
                      onChange={(e) =>
                        handleSettingChange(
                          "smsNotifications",
                          e.target.checked
                        )
                      }
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-300">
                        Notifications de nouveaux objets
                      </label>
                      <p className="text-sm text-gray-500">
                        Avertir lorsqu'un nouvel objet est signalé
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.newItemNotifications}
                      onChange={(e) =>
                        handleSettingChange(
                          "newItemNotifications",
                          e.target.checked
                        )
                      }
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-300">
                        Notifications de réclamations
                      </label>
                      <p className="text-sm text-gray-500">
                        Avertir lorsqu'un objet est réclamé
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.claimNotifications}
                      onChange={(e) =>
                        handleSettingChange(
                          "claimNotifications",
                          e.target.checked
                        )
                      }
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-300">
                        Notifications de rappel
                      </label>
                      <p className="text-sm text-gray-500">
                        Envoyer des rappels pour les objets en attente
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.reminderNotifications}
                      onChange={(e) =>
                        handleSettingChange(
                          "reminderNotifications",
                          e.target.checked
                        )
                      }
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === "security" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white">
                  Paramètres de sécurité
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Expiration du mot de passe (jours)
                    </label>
                    <input
                      type="number"
                      value={settings.passwordExpiry}
                      onChange={(e) =>
                        handleSettingChange(
                          "passwordExpiry",
                          parseInt(e.target.value)
                        )
                      }
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Délai d'expiration de session (minutes)
                    </label>
                    <input
                      type="number"
                      value={settings.sessionTimeout}
                      onChange={(e) =>
                        handleSettingChange(
                          "sessionTimeout",
                          parseInt(e.target.value)
                        )
                      }
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tentatives de connexion maximales
                    </label>
                    <input
                      type="number"
                      value={settings.maxLoginAttempts}
                      onChange={(e) =>
                        handleSettingChange(
                          "maxLoginAttempts",
                          parseInt(e.target.value)
                        )
                      }
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-300">
                        Authentification à deux facteurs
                      </label>
                      <p className="text-sm text-gray-500">
                        Exiger la 2FA pour tous les utilisateurs
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.enableTwoFactor}
                      onChange={(e) =>
                        handleSettingChange("enableTwoFactor", e.target.checked)
                      }
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-300">
                        Exiger le changement de mot de passe
                      </label>
                      <p className="text-sm text-gray-500">
                        Forcer les utilisateurs à changer les mots de passe par défaut
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.requirePasswordChange}
                      onChange={(e) =>
                        handleSettingChange(
                          "requirePasswordChange",
                          e.target.checked
                        )
                      }
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* System Settings */}
            {activeTab === "system" && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white">
                  Paramètres système
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Expiration des objets (jours)
                    </label>
                    <input
                      type="number"
                      value={settings.itemExpiryDays}
                      onChange={(e) =>
                        handleSettingChange(
                          "itemExpiryDays",
                          parseInt(e.target.value)
                        )
                      }
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Taille maximale des images (Mo)
                    </label>
                    <input
                      type="number"
                      value={settings.maxImageSize}
                      onChange={(e) =>
                        handleSettingChange(
                          "maxImageSize",
                          parseInt(e.target.value)
                        )
                      }
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-300">
                        Suppression auto des objets expirés
                      </label>
                      <p className="text-sm text-gray-500">
                        Supprimer automatiquement les objets expirés
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.autoDeleteExpiredItems}
                      onChange={(e) =>
                        handleSettingChange(
                          "autoDeleteExpiredItems",
                          e.target.checked
                        )
                      }
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-300">
                        Exiger l'approbation des objets
                      </label>
                      <p className="text-sm text-gray-500">
                        Les objets doivent être approuvés avant d'être visibles
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.requireItemApproval}
                      onChange={(e) =>
                        handleSettingChange(
                          "requireItemApproval",
                          e.target.checked
                        )
                      }
                      className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Email Settings */}
            {activeTab === "email" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">
                    Paramètres e-mail (démo)
                  </h2>
                  <button
                    onClick={handleTestEmail}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    Tester l'e-mail
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Hôte SMTP
                    </label>
                    <input
                      type="text"
                      value={settings.smtpHost}
                      onChange={(e) =>
                        handleSettingChange("smtpHost", e.target.value)
                      }
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Port SMTP
                    </label>
                    <input
                      type="number"
                      value={settings.smtpPort}
                      onChange={(e) =>
                        handleSettingChange(
                          "smtpPort",
                          parseInt(e.target.value)
                        )
                      }
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nom d'utilisateur SMTP
                    </label>
                    <input
                      type="text"
                      value={settings.smtpUsername}
                      onChange={(e) =>
                        handleSettingChange("smtpUsername", e.target.value)
                      }
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Mot de passe SMTP
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={settings.smtpPassword}
                        onChange={(e) =>
                          handleSettingChange("smtpPassword", e.target.value)
                        }
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nom de l'expéditeur
                    </label>
                    <input
                      type="text"
                      value={settings.fromName}
                      onChange={(e) =>
                        handleSettingChange("fromName", e.target.value)
                      }
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      E-mail de l'expéditeur
                    </label>
                    <input
                      type="email"
                      value={settings.fromEmail}
                      onChange={(e) =>
                        handleSettingChange("fromEmail", e.target.value)
                      }
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-300">
                      Utiliser SSL/TLS
                    </label>
                    <p className="text-sm text-gray-500">
                      Activer la transmission sécurisée des e-mails
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.smtpSecure}
                    onChange={(e) =>
                      handleSettingChange("smtpSecure", e.target.checked)
                    }
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
