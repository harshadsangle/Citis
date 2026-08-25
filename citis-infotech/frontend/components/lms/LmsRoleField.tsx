import { Label } from "@/components/ui/label";
import { LMS_ROLES } from "@/lib/lms-auth";

export function LmsRoleField({ defaultValue = "student" }: { defaultValue?: "student" | "instructor" | "admin" }) {
  return (
    <div>
      <Label htmlFor="lms-role">I am signing in as</Label>
      <select id="lms-role" name="role" defaultValue={defaultValue} className="mt-2 flex h-11 w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm shadow-xs transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:outline-none">
        {LMS_ROLES.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}
      </select>
      <p className="mt-2 text-xs text-muted-foreground">{LMS_ROLES.find((role) => role.value === defaultValue)?.description}</p>
    </div>
  );
}