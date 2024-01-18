import { Column, CreateDateColumn, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { UserRole } from "../../common/enums";
import { Message } from "../../messages/entities/message.entity";
import { Ticket } from "../../tickets/entities/ticket.entity";


@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    uuid: string;

    @Column({ nullable: false })
    name: string;

    @Column({ unique: true, nullable: false })
    email: string

    @Column({ nullable: false })
    password: string;

    @Column({ enum: UserRole, default: UserRole.CUSTOMER, nullable: false })
    role: UserRole;

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at: Date;

    @OneToMany(() => Ticket, ticket => ticket.customer)
    tickets: Ticket[];

    @ManyToMany(() => Ticket, ticket => ticket.agents)
    assigned_tickets: Ticket[];

    @OneToMany(() => Message, message => message.user)
    messages: Message[];
}
