package br.com.conuv.crud_produtos.service;

import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import br.com.conuv.crud_produtos.entity.Venda;
import br.com.conuv.crud_produtos.repository.RepositorioVendas;

@Service
public class ServicoVendas {

    private RepositorioVendas repositorioVendas;

    public ServicoVendas(RepositorioVendas repositorioVendas) {
        this.repositorioVendas = repositorioVendas;
    }

    public List<Venda> create(Venda venda) {
        repositorioVendas.save(venda);
        return list();
    }

    public List<Venda> list() {
        Sort sort = Sort.by("id").descending();
        return repositorioVendas.findAll(sort);
    }

    public List<Venda> update(Venda venda) {
        repositorioVendas.save(venda);
        return list();
    }

    public List<Venda> delete(Long id) {
        repositorioVendas.deleteById(id);
        return list();
    }
}