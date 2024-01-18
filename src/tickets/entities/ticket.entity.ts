import exp from "constants";
import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export enum TicketStatus {
    OPEN = 'OPEN',
    IN_PROGRESS = 'IN_PROGRESS',
    RESOLVED = 'RESOLVED',
    CLOSED = 'CLOSED'
}

export enum TicketType {
    LOAN_APPLICATION_STATUS = 'LOAN_APPLICATION_STATUS',
    REPAYMENT_ISSUES = 'REPAYMENT_ISSUES',
    LOAN_APPROVAL_PROCESS = 'LOAN_APPROVAL_PROCESS',
    ACCOUNT_MANAGEMENT = 'ACCOUNT_MANAGEMENT',
    TECHNICAL_ISSUES = 'TECHNICAL_ISSUES',
    OTHER = 'OTHER'
}

@Entity()
export class Ticket {
    @PrimaryGeneratedColumn('uuid')
    uuid: string;

    @Column({ nullable: false })
    title: string;

    @Column({ nullable: false })
    description: string;

    @Column({ type: 'enum', enum: TicketStatus, default: TicketStatus.OPEN })
    status: TicketStatus

    @Column({ type: 'enum', enum: TicketType, default: TicketType.OTHER})
    ticket_type: TicketType;

    @CreateDateColumn({ type: 'timestamp'})
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp'})
    updated_at: Date;

    @ManyToOne(() => User, user => user.tickets)
    customer: User;

    @ManyToMany(() => User, user => user.assigned_tickets)
    @JoinTable()
    agents: User[];
}
