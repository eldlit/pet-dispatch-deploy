import { Injectable, NotFoundException } from '@nestjs/common';
// import {PrismaService} from "../../prisma/prisma.service";
// import {ResponseRideDto} from "../model/response.order.dto";
// import {CreateRideDto} from "../model/create.order.dto";
//
@Injectable()
export class RidesService {
//     constructor(private readonly prisma: PrismaService) {}
//
//     async getAllRides(): Promise<ResponseRideDto[]> {
//         return this.prisma.ride.findMany();
//     }
//
//     async getRideById(id: number): Promise<ResponseRideDto> {
//         const ride = await this.prisma.ride.findUnique({ where: { id } });
//         if (!ride) {
//             throw new NotFoundException(`Ride with ID ${id} not found`);
//         }
//         return ride;
//     }
//
//     async createRide(createRideDto: CreateRideDto): Promise<ResponseRideDto> {
//         const ride = await this.prisma.ride.create({
//             data: createRideDto,
//         });
//         return ride;
//    }
}
