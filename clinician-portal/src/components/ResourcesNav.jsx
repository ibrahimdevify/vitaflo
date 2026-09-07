import { useState } from "react";
import { ChevronDown, ChevronUp, FileText } from "lucide-react";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "./ui/sidebar";

// [CONFIG] Add a new resource by adding one line here + dropping the
// matching PDF into `public/resources/` (see note below the component).
const RESOURCES = [
  { label: "Assessing Asthma", file: "assessing-asthma.pdf" },
  { label: "Asthma Action Plan", file: "asthma-action-plan.pdf" },
  { label: "Spirometry Summary", file: "spirometry-summary.pdf" },
  { label: "ATS 2019 Update", file: "ats-2019-update.pdf" },
  { label: "Interpretation of PFTs", file: "interpretation-of-pfts.pdf" },
];

export default function ResourcesNav() {
  const [open, setOpen] = useState(true);

  return (
    <SidebarGroup>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton onClick={() => setOpen((o) => !o)}>
            <FileText />
            <span>Resources</span>
            {open ? (
              <ChevronUp className="ml-auto h-4 w-4" />
            ) : (
              <ChevronDown className="ml-auto h-4 w-4" />
            )}
          </SidebarMenuButton>

          {open && (
            <SidebarMenuSub>
              {RESOURCES.map((r) => (
                <SidebarMenuSubItem key={r.file}>
                  <SidebarMenuSubButton
                    render={
                      <a
                        href={`/resources/${r.file}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    }
                  >
                    <FileText className="h-4 w-4" />
                    <span>{r.label}</span>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          )}
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}