// Texts to try the formalization on, offered while the text is empty: short, each with a conflict to settle

export interface Sample {
    readonly name: string;
    readonly text: string;
}

export const SAMPLES: readonly Sample[] = [
    {
        name: 'Tweety',
        text: 'Birds normally fly. Penguins are birds, but penguins do not fly. Tweety is a penguin.',
    },
    {
        name: 'The library',
        text: 'Students may borrow up to three books from the library. Students who have overdue books may not borrow. Anna is a student and wants to borrow a book. Anna has an overdue book, but she returned it this morning.',
    },
    {
        name: 'Working from home',
        text: "The company policy says that employees may work from home on Fridays. However, employees on probation must be in the office every day. Marco is on probation, but his manager has allowed him to work from home this Friday because his child is sick. According to the policy, a manager's written permission overrides the general rules.",
    },
    {
        name: 'Vehicles in the park',
        text: 'A city ordinance states: "No vehicles are allowed in the public park." The council minutes explain that the rule was adopted to keep the park quiet and safe for people on foot. A veterans\' association wants to place a decommissioned military truck on a pedestal as a war memorial; the truck has no engine and will never move. An ambulance drove onto the lawn to reach a jogger who had collapsed. Emergency services are generally exempt from traffic rules. Where the wording and the purpose of a rule conflict, courts in this city usually follow the purpose.',
    },
];
