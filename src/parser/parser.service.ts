import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as csv from 'csv-parser';
import * as fs from 'fs';
import * as path from 'path';
import { UserRole } from '../common/enums';
import { CreateMessageDto } from '../messages/dto/create-message.dto';
import { MessagesService } from '../messages/messages.service';
import { CreateTicketDto } from '../tickets/dto/create-ticket.dto';
import { Ticket } from '../tickets/entities/ticket.entity';
import { TicketsService } from '../tickets/tickets.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
const Chance = require('chance');

@Injectable()
export class ParserService {
    private chance = new Chance();

    constructor(
        private userService: UsersService,
        private ticketService: TicketsService,
        private messageService: MessagesService,
    ) { }

    async parseCsvFile(): Promise<void> {
        const results = [];
        console.log(path.resolve(__dirname, '..', '..', 'GeneralistRails_Project_MessageData.csv'));

        const filePath = path.resolve(__dirname, '..', '..', 'GeneralistRails_Project_MessageData.csv');
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => {
                fs.writeFileSync('output.json', JSON.stringify(results, null, 2));
            });
    }

    async sortJsonFile(): Promise<void> {
        const filePath = path.resolve(__dirname, '..', '..', 'sample-messages.json');
        const data = fs.readFileSync(filePath, 'utf8');
        const json = JSON.parse(data);
        const sortedJson = json.sort((a, b) => {
            if (a['User ID'] === b['User ID']) {
                return Number(new Date(a['Timestamp (UTC)'])) - Number(new Date(b['Timestamp (UTC)']));
            }
            return a['User ID'] - b['User ID'];
        });
        fs.writeFileSync('sorted-messages.json', JSON.stringify(sortedJson, null, 2));
    }

    async processMessages(): Promise<void> {
        // Read and parse the JSON file
        const filePath = path.resolve(__dirname, '..', '..', 'sorted-messages.json')
        const data = fs.readFileSync(filePath, 'utf8');
        const messages = JSON.parse(data);

        // Keep track of the User IDs that have been seen
        const seenUserIds = new Map();

        for (const message of messages) {
            // Check if the user exists
            let user = seenUserIds.has(message['User ID']) ?
                await this.userService.findOneCustomer(seenUserIds.get(message['User ID'])) : null;

            console.log('User found', user)

            // If the user doesn't exist, create a new user
            const name = this.chance.name();
            const email = `${name.toLowerCase().replace(/\s+/g, '')}@customer.com`;
            const password = await bcrypt.hash('qwerty123+', 12);
            if (!user) {
                const createUserDto: CreateUserDto = {
                    name,
                    email,
                    password,
                    role: UserRole.CUSTOMER,
                };
                user = await this.userService.create(createUserDto);
                seenUserIds.set(message['User ID'], user.uuid);
            }

            // Check if the ticket exists
            let ticket: Ticket;
            let tickets = await this.ticketService.findByCustomer(user.uuid);
            console.log('Tickets  found', tickets)


            // If the ticket doesn't exist, create a new ticket
            let isNewTicket = false;
            if (tickets.data.length === 0) {
                const createTicketDto: CreateTicketDto = {
                    customer_uuid: user.uuid,
                    title: message['Message Body'].split(' ').slice(0, 7).join(' '), // Use the first 7 words as the title
                    description: message['Message Body'], // Use the first message as the description
                };
                ticket = await this.ticketService.create(createTicketDto);
                console.log('Ticket created', ticket)
                isNewTicket = true;
            } else {
                ticket = tickets[0];
            }

            // Create a new message associated with the ticket
            if (!isNewTicket) {
                const createMessageDto: CreateMessageDto = {
                    sender_uuid: user.uuid,
                    ticket_uuid: ticket.uuid,
                    content: message['Message Body'],
                };
                const created_message = await this.messageService.create(createMessageDto);
                console.log('Message created', created_message)
            }
        }
    }
}
