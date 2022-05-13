create table if not exists usuarios (
	id serial primary key,
  	nome text not null,
  	email varchar(50) not null unique,
  	senha text not null
);

create table if not exists categorias (
	id serial primary key,
  	descricao text
);

create table transacoes (
	id serial primary key,
  	descricao text,
  	valor integer not null,
  	data timestamptz not null,
  	categoria_id integer not null,
  	usuario_id integer not null,
  	tipo text,
  	foreign key (categoria_id) references categorias (id),
  	foreign key (usuario_id) references usuarios (id)
);


