package br.com.conuv.crud_produtos.controller;

import java.util.List;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import br.com.conuv.crud_produtos.entity.Venda;
import br.com.conuv.crud_produtos.service.ServicoVendas;

@RestController
@RequestMapping("/vendas")
public class VendaController {
    ServicoVendas servicoVendas;

    public VendaController(ServicoVendas servicoVendas) {
        this.servicoVendas = servicoVendas;
    }

    @PostMapping
    List<Venda> create(@RequestBody Venda venda) {
        return servicoVendas.create(venda);
    }

    @GetMapping
    List<Venda> list() {
        return servicoVendas.list();
    }

    @PutMapping
    List<Venda> update(@RequestBody Venda venda) {
        return servicoVendas.update(venda);
    }

    @DeleteMapping("{id}")
    List<Venda> delete(@PathVariable("id") Long id) {
        return servicoVendas.delete(id);
    }
}