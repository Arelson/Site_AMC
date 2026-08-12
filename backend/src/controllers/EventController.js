import prisma from "../database/prisma.js";

// CREATE - Criar um novo evento
export const createEvent = async (req, res) => {
  try {
    // 1. Pegamos os dados que o Front-end enviou no 'corpo' da requisição
    const { title, banner, description, date, location } = req.body;

    // 2. Validação básica de segurança
    if (!title || !date || !location) {
      return res.status(400).json({ error: 'Título, data e local são obrigatórios.' });
    }

    // 3. Pedimos ao Prisma para salvar no banco de dados
    const newEvent = await prisma.events.create({
      data: {
        title,
        banner: banner || null,
        description: description || "", // Se vier vazio, salva como texto vazio
        date: new Date(date),           // Converte a string de data para o formato nativo do Date
        location,
      },
    });

    // 4. Devolvemos o evento recém-criado com status 201 (Created)
    return res.status(201).json(newEvent);
    
  } catch (error) {
    console.error('Erro ao criar evento:', error);
    return res.status(500).json({ error: 'Erro interno ao criar o evento.' });
  }
};

// READ - Buscar todos os eventos
export const getAllEvents = async (req, res) => {
  try {
    const events = await prisma.events.findMany({
      // Ordenamos para que os eventos mais próximos (data mais antiga/recente) apareçam primeiro
      orderBy: {
        date: 'asc',
      },
    });

    return res.status(200).json(events);
  } catch (error) {
    console.error('Erro ao buscar eventos:', error);
    return res.status(500).json({ error: 'Erro interno ao buscar os eventos.' });
  }
};

// READ - Buscar um evento específico pelo ID
export const getEventById = async (req, res) => {
  try {
    const { id } = req.params; // Pegamos o ID da URL

    const event = await prisma.events.findUnique({
      where: { id: Number(id) },
    });

    if (!event) {
      return res.status(404).json({ error: 'Evento não encontrado.' });
    }

    return res.status(200).json(event);
  } catch (error) {
    console.error('Erro ao buscar evento:', error);
    return res.status(500).json({ error: 'Erro interno ao buscar o evento.' });
  }
};

// UPDATE - Atualizar as informações de um evento
export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, banner, description, date, location } = req.body;

    const updatedEvent = await prisma.events.update({
      where: { id: Number(id)},
      data: {
        title,
        description,
        banner,
        // Só tenta converter a data se ela tiver sido enviada
        date: date ? new Date(date) : undefined, 
        location,
      },
    });

    return res.status(200).json(updatedEvent);
  } catch (error) {
    console.error('Erro ao atualizar evento:', error);
    // Erro P2025 do Prisma significa que o ID não existe no banco
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Evento não encontrado para atualização.' });
    }
    return res.status(500).json({ error: 'Erro interno ao atualizar o evento.' });
  }
};

// DELETE - Apagar um evento do banco
export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.events.delete({
      where: { id },
    });

    return res.status(200).json({ message: 'Evento deletado com sucesso.' });
  } catch (error) {
    console.error('Erro ao deletar evento:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Evento não encontrado para deleção.' });
    }
    return res.status(500).json({ error: 'Erro interno ao deletar o evento.' });
  }
};

export const registerForEvent = async (req, res) =>{
  try{
    const {id} = req.params; //pega o id dos eventos na URL
    const {nome, cpf, matricula, email, telefone} = req.body;

    // Salvando no banco de dados
    const novaInscricao = await prisma.eventRegistration.create({
      data: {
        nome, cpf, matricula, email, telefone, eventId: Number(id)
      }
    });

    res.status(201).json({message: "Inscrção realizada com sucesso!", inscricao: novaInscricao });
  } catch(error){
    console.error(error);
    res.status(500).json({error: "Erro ao realaizar inscrição"});
  }
};

export const exportRegistrations = async (req, res) =>{
  try{
    const {id} = req.params;

    // Buscando as inscrções do evento
    const inscricoes = await prisma.eventRegistration.findMany({
      where: {eventId: Number(id)},
      orderBy: {createdAt: 'asc'}
    })

    let csv = "Nome;CPF;Matricula;Email;Telefone;Data de inscricao\n";

    inscricoes.forEach(i => {
      const dataFormat = new Date(i.createdAt).toLocaleString('pt-BR');
      csv += `${i.nome};${i.cpf};${i.matricula || '-'};${i.email};${i.telefone};${dataFormat}\n`;
    });

    //Avisando o navg que é um aqv de download
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="inscritos_evento_${id}.csv"`);

    //Envio
    res.status(200).send(csv);
  } catch(error){
    console.error(error);
    res.status(500).json({error: "Erro ao exporta o documento."});
  }
};
