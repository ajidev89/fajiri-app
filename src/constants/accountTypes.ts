export interface AccountTypeOption {
    id: string;
    name: string;
    labelNumber?: string;
    tagline?: string;
    description: string;
    subTypes?: AccountTypeOption[];
}

export const ACCOUNT_TYPES: AccountTypeOption[] = [
    {
        id: "identified-membership",
        name: "Identified Membership",
        labelNumber: "1",
        tagline: "Outreach & Community Engagement",
        description:
            "Select to get started with Friends and Family humanitarian outreach, Brand Ambassador engagement tools, fundraising wallet access, and participation activity tracking as you introduce yourself to the Foundation.",
    },
    {
        id: "program-membership",
        name: "Fajiri Program Membership",
        labelNumber: "2",
        tagline: "Fajiri United Plan & Projects",
        description:
            "Select if you would like to participate in the Fajiri United Plan to support, fundraise, coordinate, or contribute toward community development projects and humanitarian outreach programs.",
    },
    {
        id: "corporate-membership",
        name: "Corporate Membership",
        labelNumber: "3",
        tagline: "CSR & Institutional Partnership",
        description:
            "Select if interested in Corporate Partnership as a Global Collaborator or Sponsor for long-term humanitarian and community development initiatives that fulfill your Corporate Social Responsibility (CSR) goals.",
        subTypes: [
            {
                id: "global-collaborators",
                name: "Global Collaborators",
                labelNumber: "3a",
                tagline: "Ventures & Proceeds Allocation",
                description:
                    "Select to partner with Fajiri for support or fundraising to launch or expand community ventures, with a commitment to allocate a portion of proceeds to humanitarian outreach programs and activities.",
            },
            {
                id: "global-sponsors",
                name: "Global Sponsors",
                labelNumber: "3b",
                tagline: "CSR Sponsorship & Support",
                description:
                    "Select to support an individual, program, initiative, event, or project as part of your Corporate Social Responsibility (CSR).",
            },
        ],
    },
];
