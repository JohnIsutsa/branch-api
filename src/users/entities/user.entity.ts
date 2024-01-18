import e from "express";
import { Ticket } from "src/tickets/entities/ticket.entity";
import { Column, CreateDateColumn, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export enum UserRole {
    CUSTOMER = 'customer',
    AGENT = 'agent',
}

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    uuid: string;

    @Column({ nullable: false})
    name: string;

    @Column({ unique: true, nullable: false })
    email: string

    @Column({ nullable: false})
    password: string;

    @Column({ enum: UserRole, default: UserRole.CUSTOMER, nullable: false })
    role: string;

    @CreateDateColumn({ type: 'timestamp'})
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp'})
    updated_at: Date;

    @OneToMany(() => Ticket, ticket => ticket.customer)
    tickets: Ticket[];

    @ManyToMany(() => Ticket, ticket => ticket.agents)
    assigned_tickets: Ticket[];
}
