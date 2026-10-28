"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { DoseItem, DoseLog, DoseStatus, Medicine, Profile, User } from "./types";
import { addDays, scheduledTimestamp, todayStr, uid } from "./dates";
import { apolloClient, REGISTER, LOGIN } from "./graphql";

/**
 * Local data layer (localStorage) so the frontend runs stand-alone.
 * Swap these actions for the Apollo operations in lib/graphql.ts once the
 * NestJS GraphQL backend is available.
 */



interface UserData {
  profiles: Profile[];
  medicines: Medicine[];
  logs: DoseLog[];
}

const SESSION_KEY = "mr_session";
const dataKey = (userId: string) => `mr_data_${userId}`;

function read<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable or full */
  }
}

interface AppState {
  ready: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<string | null>;
register: (name: string, email: string, password: string) => Promise<string | null>;
  logout: () => void;

  profiles: Profile[];
  activeProfile: Profile | null;
  setActiveProfileId: (id: string) => void;
  addProfile: (name: string, relation: string, email?: string) => void;
  removeProfile: (id: string) => void;

  medicines: Medicine[];
  addMedicine: (m: Omit<Medicine, "id" | "profileId">) => void;
  updateMedicine: (id: string, m: Omit<Medicine, "id" | "profileId">) => void;
  deleteMedicine: (id: string) => void;

  logs: DoseLog[];
  setDoseStatus: (item: DoseItem, status: DoseStatus) => void;
  snoozeDose: (item: DoseItem, minutes: number) => void;
  resetDose: (item: DoseItem) => void;

  dosesForDate: (date: string) => DoseItem[];
  now: number;
  notificationsEnabled: boolean;
  enableNotifications: () => Promise<void>;
}

const AppContext = createContext<AppState | null>(null);

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [data, setData] = useState<UserData>({ profiles: [], medicines: [], logs: [] });
  const [activeProfileId, setActiveProfileId] = useState<string>("");
  const [now, setNow] = useState<number>(() => Date.now());
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const notified = useRef<Set<string>>(new Set());

  const loadUserData = useCallback((u: User) => {
    const stored = read<UserData | null>(dataKey(u.id), null);
    const self: Profile = { id: u.id, name: u.name, relation: "Self", email: u.email, isSelf: true };
    const next: UserData = stored ?? { profiles: [self], medicines: [], logs: [] };
    if (!next.profiles.some((p) => p.isSelf)) next.profiles.unshift(self);
    setData(next);
    setActiveProfileId(u.id);
  }, []);

  // Restore session on first load
  useEffect(() => {
    const session = read<User | null>(SESSION_KEY, null);
    if (session) {
      setUser(session);
      loadUserData(session);
    }
    if (typeof Notification !== "undefined") {
      setNotificationsEnabled(Notification.permission === "granted");
    }
    setReady(true);
  }, [loadUserData]);

  // Persist user data
  useEffect(() => {
    if (user && ready) write(dataKey(user.id), data);
  }, [data, user, ready]);

  // Clock tick
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  /* ---------- auth ---------- */
    const register = useCallback(
    async (name: string, email: string, password: string): Promise<string | null> => {
      try {
        const result = await apolloClient.mutate({
          mutation: REGISTER,
          variables: {
            input: {
              name: name.trim(),
              email: email.trim().toLowerCase(),
              password,
            },
          },
        });

        const created = result.data?.register?.user;
        const token = result.data?.register?.accessToken;

        if (!created || !token) {
          return "Registration failed. Please try again.";
        }

        const session: User = {
          id: created.id,
          name: created.name,
          email: created.email,
        };

        window.localStorage.setItem("mr_token", token);
        write(SESSION_KEY, session);
        setUser(session);
        loadUserData(session);

        return null;
      } catch (error) {
        return error instanceof Error
          ? error.message
          : "Registration failed. Please try again.";
      }
    },
    [loadUserData],
  );

    const login = useCallback(
    async (email: string, password: string): Promise<string | null> => {
      try {
        const result = await apolloClient.mutate({
          mutation: LOGIN,
          variables: {
            input: {
              email: email.trim().toLowerCase(),
              password,
            },
          },
        });

        const loggedIn = result.data?.login?.user;
        const token = result.data?.login?.accessToken;

        if (!loggedIn || !token) {
          return "Login failed. Please try again.";
        }

        const session: User = {
          id: loggedIn.id,
          name: loggedIn.name,
          email: loggedIn.email,
        };

        window.localStorage.setItem("mr_token", token);
        write(SESSION_KEY, session);
        setUser(session);
        loadUserData(session);

        return null;
      } catch (error) {
        return error instanceof Error
          ? error.message
          : "Login failed. Please try again.";
      }
    },
    [loadUserData],
  );

  const logout = useCallback(() => {
  try {
    window.localStorage.removeItem(SESSION_KEY);
    window.localStorage.removeItem("mr_token");
  } catch {
    /* ignore */
  }
  setUser(null);
  setData({ profiles: [], medicines: [], logs: [] });
  setActiveProfileId("");
}, []);
  /* ---------- profiles ---------- */
  const addProfile = useCallback((name: string, relation: string, email?: string) => {
    setData((d) => ({
      ...d,
      profiles: [...d.profiles, { id: uid(), name: name.trim(), relation, email, isSelf: false }],
    }));
  }, []);

  const removeProfile = useCallback(
    (id: string) => {
      setData((d) => ({
        profiles: d.profiles.filter((p) => p.id !== id || p.isSelf),
        medicines: d.medicines.filter((m) => m.profileId !== id),
        logs: d.logs.filter((l) => l.profileId !== id),
      }));
      setActiveProfileId((cur) => (cur === id && user ? user.id : cur));
    },
    [user],
  );

  const activeProfile = useMemo(
    () => data.profiles.find((p) => p.id === activeProfileId) ?? data.profiles[0] ?? null,
    [data.profiles, activeProfileId],
  );

  /* ---------- medicines ---------- */
  const medicines = useMemo(
    () => data.medicines.filter((m) => m.profileId === activeProfile?.id),
    [data.medicines, activeProfile],
  );

  const addMedicine = useCallback(
    (m: Omit<Medicine, "id" | "profileId">) => {
      if (!activeProfile) return;
      setData((d) => ({
        ...d,
        medicines: [...d.medicines, { ...m, id: uid(), profileId: activeProfile.id }],
      }));
    },
    [activeProfile],
  );

  const updateMedicine = useCallback((id: string, m: Omit<Medicine, "id" | "profileId">) => {
    setData((d) => ({
      ...d,
      medicines: d.medicines.map((x) => (x.id === id ? { ...x, ...m } : x)),
    }));
  }, []);

  const deleteMedicine = useCallback((id: string) => {
    setData((d) => ({
      ...d,
      medicines: d.medicines.filter((m) => m.id !== id),
      logs: d.logs.filter((l) => l.medicineId !== id),
    }));
  }, []);

  /* ---------- logs ---------- */
  const logs = useMemo(
    () => data.logs.filter((l) => l.profileId === activeProfile?.id),
    [data.logs, activeProfile],
  );

  const upsertLog = useCallback((item: DoseItem, status: DoseStatus, snoozeUntil?: number) => {
    setData((d) => {
      const existing = d.logs.find(
        (l) => l.medicineId === item.medicine.id && l.date === item.date && l.time === item.time,
      );
      const base = {
        status,
        snoozeUntil,
        updatedAt: Date.now(),
      };
      if (existing) {
        return { ...d, logs: d.logs.map((l) => (l.id === existing.id ? { ...l, ...base } : l)) };
      }
      const created: DoseLog = {
        id: uid(),
        medicineId: item.medicine.id,
        profileId: item.medicine.profileId,
        date: item.date,
        time: item.time,
        ...base,
      };
      return { ...d, logs: [...d.logs, created] };
    });
  }, []);

  const setDoseStatus = useCallback(
    (item: DoseItem, status: DoseStatus) => upsertLog(item, status),
    [upsertLog],
  );

  const snoozeDose = useCallback(
    (item: DoseItem, minutes: number) => upsertLog(item, "snoozed", Date.now() + minutes * 60_000),
    [upsertLog],
  );

  const resetDose = useCallback((item: DoseItem) => {
    setData((d) => ({
      ...d,
      logs: d.logs.filter(
        (l) => !(l.medicineId === item.medicine.id && l.date === item.date && l.time === item.time),
      ),
    }));
  }, []);

  const dosesForDate = useCallback(
    (date: string): DoseItem[] => {
      const items: DoseItem[] = [];
      for (const medicine of medicines) {
        if (date < medicine.startDate) continue;
        if (medicine.endDate && date > medicine.endDate) continue;
        for (const time of medicine.times) {
          const log = logs.find(
            (l) => l.medicineId === medicine.id && l.date === date && l.time === time,
          );
          items.push({
            key: `${medicine.id}-${date}-${time}`,
            medicine,
            date,
            time,
            scheduledAt: scheduledTimestamp(date, time),
            log,
          });
        }
      }
      return items.sort((a, b) => a.scheduledAt - b.scheduledAt);
    },
    [medicines, logs],
  );

  /* ---------- browser notifications ---------- */
  const enableNotifications = useCallback(async () => {
    if (typeof Notification === "undefined") return;
    const result = await Notification.requestPermission();
    setNotificationsEnabled(result === "granted");
  }, []);

  useEffect(() => {
    if (!notificationsEnabled || typeof Notification === "undefined") return;
    const today = dosesForDate(todayStr());
    for (const item of today) {
      const dueAt =
        item.log?.status === "snoozed" && item.log.snoozeUntil ? item.log.snoozeUntil : item.scheduledAt;
      const isOpen = !item.log || item.log.status === "snoozed";
      if (isOpen && dueAt <= now && now - dueAt < 10 * 60_000) {
        const key = `${item.key}-${dueAt}`;
        if (!notified.current.has(key)) {
          notified.current.add(key);
          new Notification("Time for your medicine", {
            body: `${item.medicine.name} (${item.medicine.dosage}) — ${activeProfile?.name ?? ""}`,
          });
        }
      }
    }
  }, [now, notificationsEnabled, dosesForDate, activeProfile]);

  const value: AppState = {
    ready,
    user,
    login,
    register,
    logout,
    profiles: data.profiles,
    activeProfile,
    setActiveProfileId,
    addProfile,
    removeProfile,
    medicines,
    addMedicine,
    updateMedicine,
    deleteMedicine,
    logs,
    setDoseStatus,
    snoozeDose,
    resetDose,
    dosesForDate,
    now,
    notificationsEnabled,
    enableNotifications,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

/** Helper used by pages: effective status of a dose at a point in time. */
export type EffectiveStatus = "taken" | "missed" | "snoozed" | "due" | "overdue" | "upcoming";

export const MISSED_AFTER_MS = 60 * 60_000;

export function effectiveStatus(item: DoseItem, now: number): EffectiveStatus {
  if (item.log?.status === "taken") return "taken";
  if (item.log?.status === "missed") return "missed";
  const dueAt =
    item.log?.status === "snoozed" && item.log.snoozeUntil ? item.log.snoozeUntil : item.scheduledAt;
  if (item.log?.status === "snoozed") {
    return now >= dueAt ? "due" : "snoozed";
  }
  if (now < item.scheduledAt) return "upcoming";
  if (now - item.scheduledAt > MISSED_AFTER_MS) return "overdue";
  return "due";
}

export { addDays };
