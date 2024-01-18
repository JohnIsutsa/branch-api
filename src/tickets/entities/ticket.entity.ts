import { TicketStatus, TicketType } from "../../common/enums";
import { Message } from "src/messages/entities/message.entity";
import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

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

    @OneToMany(() => Message, message => message.ticket)
    messages: Message[];
}
