import {PrismaClient} from '@prisma/client';
const prisma = new PrismaClient();

export const logAction = async(userId, action, entity, entityId = null, details = null) =>{
    try {
        await prisma.actionLog.create({
            data:{
                userId,
                action,
                entity,
                entityId,
                details
            }
        });
    } catch (error) {
        console.error("Erro de resgistro do log", error);
    }
}