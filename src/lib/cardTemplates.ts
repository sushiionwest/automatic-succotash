/**
 * SAE Task Templates
 * Pre-filled scaffolds to minimize typing and guide new members
 */

export interface CardTemplate {
    id: string;
    name: string;
    taskType: string;
    description: string;
    acceptanceCriteria: string;
    priority: "P0" | "P1" | "P2" | "P3";
    isOnboarding: boolean;
}

export const CARD_TEMPLATES: CardTemplate[] = [
    {
        id: "design",
        name: "Design Task",
        taskType: "Design",
        description: `1. Review requirements/constraints
2. Create initial sketches/CAD model
3. Get feedback from team lead
4. Finalize design with dimensions`,
        acceptanceCriteria: `- [ ] CAD model uploaded to Drive
- [ ] Drawing with key dimensions
- [ ] Lead reviewed and approved
- [ ] Link added to this card`,
        priority: "P2",
        isOnboarding: false,
    },
    {
        id: "build",
        name: "Build Task",
        taskType: "Build",
        description: `1. Gather materials from inventory
2. Follow build instructions/CAD
3. Take photos during assembly
4. Log any issues encountered`,
        acceptanceCriteria: `- [ ] Part built to spec
- [ ] Photo(s) of completed work
- [ ] Any issues logged
- [ ] Cleaned up workspace`,
        priority: "P2",
        isOnboarding: true,
    },
    {
        id: "test",
        name: "Test Task",
        taskType: "Test",
        description: `1. Set up test environment
2. Follow test procedure
3. Record all data points
4. Document any anomalies`,
        acceptanceCriteria: `- [ ] Test data logged (spreadsheet/photo)
- [ ] Pass/fail result recorded
- [ ] Next steps identified if failed
- [ ] Equipment returned/cleaned`,
        priority: "P1",
        isOnboarding: false,
    },
    {
        id: "procurement",
        name: "Procurement Task",
        taskType: "Procurement",
        description: `1. Identify exact part needed (link/PN)
2. Check budget with lead
3. Submit purchase request
4. Track delivery`,
        acceptanceCriteria: `- [ ] Part link/PN in Inputs
- [ ] Price confirmed under budget
- [ ] Order placed (screenshot)
- [ ] Delivery tracked`,
        priority: "P2",
        isOnboarding: false,
    },
    {
        id: "docs",
        name: "Documentation / Report",
        taskType: "Docs",
        description: `1. Gather data/photos/results
2. Write draft in Google Docs
3. Get peer review
4. Submit final version`,
        acceptanceCriteria: `- [ ] Document drafted
- [ ] Reviewed by 1+ teammate
- [ ] Final version linked
- [ ] Shared with team`,
        priority: "P3",
        isOnboarding: true,
    },
    {
        id: "research",
        name: "Research Task",
        taskType: "Docs",
        description: `1. Define research question
2. Find 3+ sources (papers, videos, forums)
3. Summarize key findings
4. Present to team (5 min)`,
        acceptanceCriteria: `- [ ] Research summary (1 page)
- [ ] Sources linked
- [ ] Key takeaways listed
- [ ] Shared in Discord/meeting`,
        priority: "P3",
        isOnboarding: true,
    },
];

export function getTemplateById(id: string): CardTemplate | undefined {
    return CARD_TEMPLATES.find(t => t.id === id);
}

export function getOnboardingTemplates(): CardTemplate[] {
    return CARD_TEMPLATES.filter(t => t.isOnboarding);
}
