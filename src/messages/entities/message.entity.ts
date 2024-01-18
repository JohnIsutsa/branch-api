import { Ticket } from "../../tickets/entities/ticket.entity";
import { User } from "../../users/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserRole } from "../../common/enums";

@Entity()
export class Message {
    @PrimaryGeneratedColumn('uuid')
    uuid: string;

    @Column()
    content: string;

    @Column({ type: 'enum', enum: UserRole, default: UserRole.CUSTOMER })
    sender: UserRole;

    @CreateDateColumn()
    timestamp: Date;

    @ManyToOne(() => User, user => user.messages)
    user: User;

    @ManyToOne(() => Ticket, ticket => ticket.messages)
    ticket: Ticket;
}
